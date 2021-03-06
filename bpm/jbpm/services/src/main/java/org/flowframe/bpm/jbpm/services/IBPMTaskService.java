package org.flowframe.bpm.jbpm.services;

import org.jbpm.task.service.TaskService;
import org.jbpm.task.service.local.LocalTaskService;

public interface IBPMTaskService {
	public TaskService getTaskService();

	public LocalTaskService getLocalTaskService();
	
	public void addUser(String userName) throws Exception;
}
