package org.flowframe.bpm.jbpm.ui.pageflow.vaadin.wizard;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.EntityManagerFactory;
import javax.transaction.UserTransaction;

import org.flowframe.bpm.jbpm.ui.pageflow.services.BasePageFlowPage;
import org.flowframe.bpm.jbpm.ui.pageflow.services.IPageComponent;
import org.flowframe.bpm.jbpm.ui.pageflow.services.IPageFlowManager;
import org.flowframe.bpm.jbpm.ui.pageflow.services.IPageFlowPage;
import org.flowframe.bpm.jbpm.ui.pageflow.services.IPageFlowSession;
import org.flowframe.bpm.jbpm.ui.pageflow.services.ITaskWizard;
import org.flowframe.bpm.jbpm.ui.pageflow.services.event.IPageFlowPageChangedEventHandler;
import org.flowframe.bpm.jbpm.ui.pageflow.services.event.IPageFlowPageChangedListener;
import org.flowframe.bpm.jbpm.ui.pageflow.services.event.PageFlowPageChangedEvent;
import org.flowframe.bpm.jbpm.ui.pageflow.vaadin.builder.VaadinPageFactoryImpl;
import org.flowframe.bpm.jbpm.ui.pageflow.vaadin.ext.form.container.VaadinBeanItemContainer;
import org.flowframe.bpm.jbpm.ui.pageflow.vaadin.ext.form.container.VaadinJPAContainer;
import org.flowframe.kernel.common.mdm.domain.BaseEntity;
import org.flowframe.kernel.common.mdm.domain.application.Feature;
import org.flowframe.kernel.jpa.container.services.IDAOProvider;
import org.flowframe.kernel.jpa.container.services.IEntityContainerProvider;
import org.flowframe.ui.services.factory.IEntityEditorFactory;
import org.flowframe.ui.vaadin.common.entityprovider.jta.CustomCachingMutableLocalEntityProvider;
import org.flowframe.ui.vaadin.common.entityprovider.jta.CustomNonCachingMutableLocalEntityProvider;
import org.flowframe.ui.vaadin.common.mvp.StartableApplicationEventBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.vaadin.mvp.presenter.IPresenter;
import org.vaadin.teemu.wizards.Wizard;
import org.vaadin.teemu.wizards.WizardStep;
import org.vaadin.teemu.wizards.event.WizardCompletedEvent;

import com.vaadin.addon.jpacontainer.JPAContainer;
import com.vaadin.addon.jpacontainer.JPAContainerFactory;
import com.vaadin.data.util.BeanItemContainer;
import com.vaadin.ui.Component;
import com.vaadin.ui.Window.Notification;

public class TaskWizard extends Wizard implements ITaskWizard, IPageFlowPageChangedEventHandler, IEntityContainerProvider {
	protected Logger logger = LoggerFactory.getLogger(this.getClass());

	private static final long serialVersionUID = 8417208260717324494L;

	private IPageFlowSession session;
	private IPageFlowManager engine;

	private HashMap<IPageFlowPage, IPageComponent> pageComponentMap;
	private VaadinPageFactoryImpl pageFactory;
	private Feature onCompletionCompletionFeature, feature;
	private final Set<IPageFlowPageChangedListener> pageFlowPageChangedListenerCache = Collections
			.synchronizedSet(new HashSet<IPageFlowPageChangedListener>());

	private boolean nextButtonBlocked = false;
	private boolean backButtonBlocked = false;

	@SuppressWarnings("unused")
	private boolean processPageFlowPageChangedEvents;

	private HashMap<String, Object> initParams;
	private UserTransaction userTransaction;

	private IDAOProvider daoProvider;
	private IPresenter<?, ?> appPresenter;

	public TaskWizard(IPageFlowSession session) {
		this.session = session;
		this.engine = session.getPageFlowEngine();
		this.userTransaction = this.engine.getUserTransaction();
		this.pageComponentMap = new HashMap<IPageFlowPage, IPageComponent>();

		HashMap<String, Object> config = new HashMap<String, Object>();
		config.put(IEntityEditorFactory.CONTAINER_PROVIDER, this);
		this.pageFactory = new VaadinPageFactoryImpl(config);

		getNextButton().setImmediate(true);
		getBackButton().setImmediate(true);

		// Init steps
		addAllPages();
	}

	public TaskWizard(IPageFlowSession session, Map<String, Object> properties) {
		this.session = session;
		this.engine = session.getPageFlowEngine();
		this.daoProvider = (IDAOProvider) properties.get("daoProvider");
		this.userTransaction = this.engine.getUserTransaction();
		this.appPresenter = (IPresenter<?, ?>) properties.get("appPresenter");
		this.pageComponentMap = new HashMap<IPageFlowPage, IPageComponent>();
		this.feature = (Feature) properties.get("feature");
		if (feature != null) {
			this.onCompletionCompletionFeature = this.feature.getOnCompletionFeature();
		}

		HashMap<String, Object> config = new HashMap<String, Object>();
		config.put(IEntityEditorFactory.CONTAINER_PROVIDER, this);
		this.pageFactory = new VaadinPageFactoryImpl(config);

		getNextButton().setImmediate(true);
		getBackButton().setImmediate(true);

		// Init steps
		addAllPages();
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public Object createPersistenceContainer(Class<?> entityClass) {
		if (this.userTransaction != null) {
			CustomCachingMutableLocalEntityProvider provider = new CustomCachingMutableLocalEntityProvider(entityClass,
					this.session.getConXEntityManagerfactory(), this.userTransaction);
			JPAContainer<?> container = new VaadinJPAContainer(entityClass, provider);
			return container;
		} else {
			return JPAContainerFactory.makeReadOnly(entityClass, this.session.getConXEntityManagerfactory().createEntityManager());
		}
	}

	private void addAllPages() {
		if (initParams == null) {
			initParams = new HashMap<String, Object>();
			initParams.put(IPageComponent.CONX_ENTITY_MANAGER_FACTORY, session.getConXEntityManagerfactory());
			initParams.put(IPageComponent.JTA_GLOBAL_TRANSACTION_MANAGER, session.getJTAGlobalTransactionManager());
			initParams.put(IPageComponent.TASK_WIZARD, this);
			initParams.put(IPageComponent.DAO_PROVIDER, this.daoProvider);
			initParams.put(IPageComponent.PAGE_FLOW_PAGE_CHANGE_EVENT_HANDLER, this);
			initParams.put(IPageComponent.ENTITY_CONTAINER_PROVIDER, this);
			initParams.put(IEntityEditorFactory.FACTORY_PARAM_MVP_CURRENT_APP_PRESENTER, this.appPresenter);
			initParams.put(IPageComponent.ENTITY_TYPE_DAO_SERVICE, this.engine.getEntityTypeDAOService());
		}
		if (session.getPages() != null) {
			for (IPageFlowPage page : session.getPages()) {
				if (page != null) {
					IPageComponent pageComponent = this.pageFactory.createPage((IPageFlowPage) page, initParams);
					if (pageComponent != null) {
						this.pageComponentMap.put(page, pageComponent);
						addStep(pageComponent);
					}
				}
			}
		}
	}

	public IPageFlowSession getSession() {
		return session;
	}

	public void setSession(IPageFlowSession session) {
		this.session = session;
	}

	@Override
	public Component getComponent() {
		return this;
	}

	public WizardStep getCurrentStep() {
		return currentStep;
	}

	public void setCurrentStep(WizardStep step) {
		currentStep = step;
	}

	@Override
	public void addStep(WizardStep step) {
		if (getSteps().size() == 0)// First page
			((IPageComponent) step).setParameterData(getProperties());
		super.addStep(step);
	}

	@Override
	public Map<String, Object> getProperties() {
		// Map<String,Object> props = new HashMap<String, Object>();
		// props.put("session",session);
		// props.putAll(session.getProcessVars());
		return session.getProcessVars();
	}

	@Override
	public Feature getOnCompletionFeature() {
		return session.getOnCompletionFeature();
	}

	@Override
	public void onNext(BasePageFlowPage currentPage, Map<String, Object> taskOutParams) {
		try {
			engine.executeTaskWizard(this, taskOutParams);
			// getProperties().
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void onPrevious(BasePageFlowPage currentPage, Map<String, Object> state) {
		// TODO Implement previous
	}

	@Override
	public void next() {
		boolean isLastStep = isLastStep(currentStep);
		try {
			completeCurrentTaskAndAdvanceToNext();
		} catch (Exception e) {
			e.printStackTrace();
			getWindow().showNotification("There was an unexpected error on the next page",
					"</br>Try to continue again. If the problem persists, contact your Administrator", Notification.TYPE_ERROR_MESSAGE);
			return;
		}

		if (isLastStep) {
			fireEvent(new WizardCompletedEvent(this));
			if (this.appPresenter instanceof IPresenter<?, ?>) {
				if (this.appPresenter.getEventBus() instanceof StartableApplicationEventBus) {
					if (this.onCompletionCompletionFeature != null) {
						((StartableApplicationEventBus) this.appPresenter.getEventBus()).openFeatureView(this.onCompletionCompletionFeature);
						((StartableApplicationEventBus) this.appPresenter.getEventBus()).closeFeatureView(this.feature);
					}
				}
			}
		} else {
			int currentIndex = steps.indexOf(currentStep);
			activateStep(steps.get(currentIndex + 1));
		}
	}

	@Override
	public void back() {
		super.back();
	}

	@Override
	public void finish() {
		next();
	}

	private void completeCurrentTaskAndAdvanceToNext() throws Exception {
		IPageComponent currentPage, nextPage;
		Map<String, Object> params = null;
		currentPage = (IPageComponent) currentStep;
		if (currentPage.isExecuted()) {
		} else {
			// Complete current task and get input variables for the next task
			try {
				params = engine.executeTaskWizard(this, currentPage.getResultData()).getProperties();
			} catch (Exception e) {
				getWindow().showNotification("Could not complete this task", "", Notification.TYPE_ERROR_MESSAGE);
				// TODO Exception Handing
				e.printStackTrace();
				return;
			}
			// Start the next task (if it exists) with input variables from
			// previous task
			int index = steps.indexOf(currentStep);
			if ((index + 1) < steps.size()) {
				nextPage = (IPageComponent) steps.get(index + 1);
				nextPage.setParameterData(params);
			}
		}
	}

	public boolean currentStepIsLastStep() {
		return isLastStep(currentStep);
	}

	@Override
	public void registerForPageFlowPageChanged(IPageFlowPageChangedListener listener) {
		pageFlowPageChangedListenerCache.add(listener);
	}

	@Override
	public void unregisterForPageFlowPageChanged(IPageFlowPageChangedListener listener) {
		pageFlowPageChangedListenerCache.remove(listener);
	}

	@Override
	public void enablePageFlowPageChangedEventHandling(boolean enable) {
		this.processPageFlowPageChangedEvents = enable;
	}

	@Override
	protected boolean isLastStep(WizardStep step) {
		return this.session.isOnLastPage();
	};

	@Override
	public void fireOnPageFlowChanged(PageFlowPageChangedEvent event) {
		for (IPageFlowPageChangedListener listener : pageFlowPageChangedListenerCache) {
			listener.onPageChanged(event);
		}
	}

	@Override
	public void setNextEnabled(boolean isEnabled) {
		getNextButton().setEnabled(isEnabled);
		nextButtonBlocked = !isEnabled;
	}

	@Override
	public boolean isNextEnabled() {
		return !nextButtonBlocked;
	}

	@Override
	public void setBackEnabled(boolean isEnabled) {
		getBackButton().setEnabled(isEnabled);
		backButtonBlocked = !isEnabled;
	}

	@Override
	public boolean isBackEnabled() {
		return !backButtonBlocked;
	}

	public void onPagesChanged() {
		List<WizardStep> stepsCopy = new ArrayList<WizardStep>();
		stepsCopy.addAll(steps);
		// Remove steps
		// for (WizardStep step_ : stepsCopy)
		// {
		// removeStep(step_);
		// }

		// Add pages from path
		if (session.getPages() != null) {
			IPageComponent pageComponent = null;
			for (IPageFlowPage page : session.getPages()) {
				if (page != null) {
					pageComponent = pageComponentMap.get(page);
					boolean stepAlreadyExists = pageComponent != null;
					if (!stepAlreadyExists) {
						pageComponent = this.pageFactory.createPage((IPageFlowPage) page, initParams);
						this.pageComponentMap.put(page, pageComponent);
						addStep(pageComponent);
					}
				}
			}
		}
	}

	@Override
	public Object createBeanContainer(Class<?> entityClass) {
		if (BaseEntity.class.isAssignableFrom(entityClass)) {
			@SuppressWarnings({ "rawtypes", "unchecked" })
			BeanItemContainer container = new VaadinBeanItemContainer(entityClass);
			return container;
		}
		return null;
	}

	@Override
	public EntityManagerFactory getEmf() {
		return this.session.getConXEntityManagerfactory();
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public Object createNonCachingPersistenceContainer(Class<?> entityClass) {
		if (this.userTransaction != null) {
			CustomNonCachingMutableLocalEntityProvider provider = new CustomNonCachingMutableLocalEntityProvider(entityClass, this.getEmf(),
					this.userTransaction);
			JPAContainer<?> container = new VaadinJPAContainer(entityClass, provider);
			return container;
		} else {
			return JPAContainerFactory.makeReadOnly(entityClass, this.getEmf().createEntityManager());
		}
	}
}
