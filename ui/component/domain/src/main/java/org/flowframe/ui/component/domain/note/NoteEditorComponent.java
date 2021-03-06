package org.flowframe.ui.component.domain.note;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import org.flowframe.ds.domain.DataSource;
import org.flowframe.ui.component.domain.AbstractComponent;
import org.flowframe.ui.component.domain.table.GridComponent;

@Entity
public class NoteEditorComponent extends AbstractComponent {
	public NoteEditorComponent() {
		super("noteeditorcomponent");
	}
	
	public NoteEditorComponent(DataSource ds) {
		this();
		setDataSource(ds);
	}		
}
