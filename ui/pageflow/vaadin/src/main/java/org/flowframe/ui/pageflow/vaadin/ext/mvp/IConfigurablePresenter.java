package org.flowframe.ui.pageflow.vaadin.ext.mvp;

import java.util.Map;

public interface IConfigurablePresenter {
	public void onConfigure(Map<String, Object> params) throws Exception;
}
