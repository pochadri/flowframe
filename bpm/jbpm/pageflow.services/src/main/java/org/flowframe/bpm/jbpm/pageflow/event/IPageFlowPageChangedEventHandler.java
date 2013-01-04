package org.flowframe.bpm.jbpm.pageflow.event;

public interface IPageFlowPageChangedEventHandler {
	public void registerForPageFlowPageChanged(IPageFlowPageChangedListener listener);
	public void unregisterForPageFlowPageChanged(IPageFlowPageChangedListener listener);
	public void enablePageFlowPageChangedEventHandling(boolean enable);
}
