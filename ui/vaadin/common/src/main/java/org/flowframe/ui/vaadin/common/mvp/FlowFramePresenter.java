package org.flowframe.ui.vaadin.common.mvp;

import org.flowframe.ui.component.domain.AbstractComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.vaadin.mvp.presenter.BasePresenter;
import org.vaadin.mvp.eventbus.EventBus;

public abstract class FlowFramePresenter<V, E extends EventBus> extends BasePresenter<V, E> {
	@Autowired
	protected AbstractMainApplication app;

	public abstract void setComponentModel(AbstractComponent componentModel);
	
}