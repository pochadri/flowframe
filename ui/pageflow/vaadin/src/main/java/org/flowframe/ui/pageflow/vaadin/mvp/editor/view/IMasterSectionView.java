package org.flowframe.ui.pageflow.vaadin.mvp.editor.view;

import org.vaadin.mvp.uibinder.IUiBindable;

import com.vaadin.ui.Component;

public interface IMasterSectionView extends IUiBindable {
	public void setHeader(Component component);
	public void setContent(Component component);
	public Component getContent();
}