package org.flowframe.ui.vaadin.common.editors.pageflow.mvp.lineeditor.section.grid.header;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.vaadin.mvp.eventbus.EventBusManager;
import org.vaadin.mvp.presenter.BasePresenter;
import org.vaadin.mvp.presenter.annotation.Presenter;

import org.flowframe.ui.vaadin.common.editors.pageflow.ext.mvp.ILocalizedEventSubscriber;
import org.flowframe.ui.vaadin.common.editors.pageflow.mvp.lineeditor.section.grid.header.view.EntityLineEditorGridHeaderView;
import org.flowframe.ui.vaadin.common.editors.pageflow.mvp.lineeditor.section.grid.header.view.IEntityLineEditorGridHeaderView;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;

@Presenter(view = EntityLineEditorGridHeaderView.class)
public class EntityLineEditorGridHeaderPresenter extends BasePresenter<IEntityLineEditorGridHeaderView, EntityLineEditorGridHeaderEventBus> implements ILocalizedEventSubscriber {
	protected Logger logger = LoggerFactory.getLogger(this.getClass());
	private boolean initialized = false;
	private EventBusManager sectionEventBusManager;

	@Override
	public void bind() {
		this.setInitialized(true);
		this.getView().init();
		this.getView().addCreateListener(new ClickListener() {
			private static final long serialVersionUID = -54023801L;

			@Override
			public void buttonClick(ClickEvent event) {
				EntityLineEditorGridHeaderPresenter.this.sectionEventBusManager.fireAnonymousEvent("create");
			}
		});
		this.getView().addEditListener(new ClickListener() {
			private static final long serialVersionUID = -52023801L;

			@Override
			public void buttonClick(ClickEvent event) {
				EntityLineEditorGridHeaderPresenter.this.sectionEventBusManager.fireAnonymousEvent("edit");
			}
		});
		this.getView().addDeleteListener(new ClickListener() {
			private static final long serialVersionUID = -50023801L;

			@Override
			public void buttonClick(ClickEvent event) {
				EntityLineEditorGridHeaderPresenter.this.sectionEventBusManager.fireAnonymousEvent("delete");
			}
		});
		this.getView().addPrintListener(new ClickListener() {
			private static final long serialVersionUID = -99023801L;

			@Override
			public void buttonClick(ClickEvent event) {
				EntityLineEditorGridHeaderPresenter.this.sectionEventBusManager.fireAnonymousEvent("print");
			}
		});
		this.getView().addReportListener(new ClickListener() {
			private static final long serialVersionUID = -99023801L;

			@Override
			public void buttonClick(ClickEvent event) {
				EntityLineEditorGridHeaderPresenter.this.sectionEventBusManager.fireAnonymousEvent("report");
			}
		});
	}

	public boolean isInitialized() {
		return initialized;
	}

	public void setInitialized(boolean initialized) {
		this.initialized = initialized;
	}

	public void onEnableCreate() {
		this.getView().setCreateEnabled(true);
	}

	public void onDisableCreate() {
		this.getView().setCreateEnabled(false);
	}

	public void onEnableEdit() {
		this.getView().setEditEnabled(true);
	}

	public void onDisableEdit() {
		this.getView().setEditEnabled(false);
	}

	public void onEnableDelete() {
		this.getView().setDeleteEnabled(true);
	}

	public void onDisableDelete() {
		this.getView().setDeleteEnabled(false);
	}

	public void onEnablePrint() {
		this.getView().setPrintEnabled(true);
	}

	public void onDisablePrint() {
		this.getView().setPrintEnabled(false);
	}

	@Override
	public void subscribe(EventBusManager eventBusManager) {
		this.sectionEventBusManager = eventBusManager;
		this.sectionEventBusManager.register(EntityLineEditorGridHeaderEventBus.class, this);
	}
}
