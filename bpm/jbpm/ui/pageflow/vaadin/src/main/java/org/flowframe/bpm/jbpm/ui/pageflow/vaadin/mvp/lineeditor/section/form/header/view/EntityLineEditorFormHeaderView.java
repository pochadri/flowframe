package org.flowframe.bpm.jbpm.ui.pageflow.vaadin.mvp.lineeditor.section.form.header.view;

import org.vaadin.mvp.uibinder.annotation.UiField;

import org.flowframe.ui.vaadin.editors.entity.vaadin.ext.EntityEditorToolStrip;
import org.flowframe.ui.vaadin.editors.entity.vaadin.ext.EntityEditorToolStrip.EntityEditorToolStripButton;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.VerticalLayout;

public class EntityLineEditorFormHeaderView extends VerticalLayout implements IEntityLineEditorFormHeaderView {
	private static final long serialVersionUID = -8556644797413509062L;

	private EntityEditorToolStrip toolStrip;
	private EntityEditorToolStripButton verifyButton;
	private EntityEditorToolStripButton saveButton;
	private EntityEditorToolStripButton resetButton;

	@UiField
	VerticalLayout mainLayout;

	public EntityLineEditorFormHeaderView() {
		setWidth("100%");
		setHeight("40px");
	}

	@Override
	public void init() {
		this.toolStrip = new EntityEditorToolStrip();

		this.verifyButton = this.toolStrip.addToolStripButton(EntityEditorToolStrip.TOOLSTRIP_IMG_VERIFY_PNG);
		this.verifyButton.setEnabled(false);

		this.saveButton = this.toolStrip.addToolStripButton(EntityEditorToolStrip.TOOLSTRIP_IMG_SAVE_PNG);
		this.saveButton.setEnabled(false);

		this.resetButton = this.toolStrip.addToolStripButton(EntityEditorToolStrip.TOOLSTRIP_IMG_RESET_PNG);
		this.resetButton.setEnabled(false);

		this.mainLayout.addComponent(this.toolStrip);
	}

	@Override
	public void addVerifyListener(ClickListener listener) {
		this.verifyButton.addListener(listener);
	}

	@Override
	public void addSaveListener(ClickListener listener) {
		this.saveButton.addListener(listener);
	}

	@Override
	public void addResetListener(ClickListener listener) {
		this.resetButton.addListener(listener);
	}

	@Override
	public void setVerifyEnabled(boolean isEnabled) {
		this.verifyButton.setEnabled(isEnabled);
	}

	@Override
	public boolean isVerifyEnabled() {
		return this.verifyButton.isEnabled();
	}

	@Override
	public void setSaveEnabled(boolean isEnabled) {
		this.saveButton.setEnabled(isEnabled);
	}

	@Override
	public boolean isSaveEnabled() {
		return this.saveButton.isEnabled();
	}

	@Override
	public void setResetEnabled(boolean isEnabled) {
		this.resetButton.setEnabled(isEnabled);
	}

	@Override
	public boolean isResetEnabled() {
		return this.resetButton.isEnabled();
	}
}
