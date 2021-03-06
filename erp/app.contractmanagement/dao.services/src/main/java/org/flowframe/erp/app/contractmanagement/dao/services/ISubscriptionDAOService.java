package org.flowframe.erp.app.contractmanagement.dao.services;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.flowframe.erp.app.contractmanagement.domain.Subscription;
import org.flowframe.erp.app.contractmanagement.domain.SubscriptionChange;
import org.flowframe.erp.app.contractmanagement.domain.SubscriptionPlan;


@Path("/IServiceDAOService")
public interface ISubscriptionDAOService {
	
	final static public String FREE_TRIAL_PLAN_NAME ="Free Plan - $0";
	final static public String BASIC_PLAN_NAME ="Basic Plan";
	final static public String PROF_PLAN_NAME ="Professional Plan";
	
	/**
	 * 
	 * Subscription
	 * 
	 */
	public Subscription get(long id);
	
	@GET
	@Path("/getall")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Subscription> getAll();
	
	public Subscription getByCode(String code);	
	
	public Subscription getByPlanIdAndCustomerId(Long planId, Long customerId);
	
	public Subscription getCurrentSubscriptionByUserEmail(String emailAddress);
	
	public Subscription getByCustomerId(Long customerId);

	public Subscription add(Subscription record);

	public void delete(Subscription record);

	public Subscription update(Subscription record);
	
	public Subscription provide(Subscription record);
	
	/**
	 * 
	 * SubscriptionChange
	 * 
	 */
	public SubscriptionChange getSubscriptionChange(long id);
	
	public List<SubscriptionChange> getAllSubscriptionChanges();
	
	public SubscriptionChange getSubscriptionChangeByCode(String code);	
	
	public SubscriptionChange addSubscriptionChange(SubscriptionChange record);
	
	/**
	 * 
	 * SubscriptionPlan
	 * 
	 */
	public SubscriptionPlan getPlan(long id);
	
	public List<SubscriptionPlan> getAllPlans();
	
	public List<SubscriptionPlan> getAllPlansAvailableForSubscriptionByUserEmail(String emailAddress);
	
	public SubscriptionPlan getCurrentSubscriptionbByUserEmail(String emailAddress);
	
	public Long getCurrentSubscriptionPlanIdByUserEmail(String emailAddress);
	
	public SubscriptionPlan getPlanByCode(String code);	
	
	public SubscriptionPlan getPlanByExternalRefId(String externalRefId);

	public SubscriptionPlan addPlan(SubscriptionPlan record);

	public void deletePlan(SubscriptionPlan record);

	public SubscriptionPlan updatePlan(SubscriptionPlan record);
	
	public SubscriptionPlan providePlan(SubscriptionPlan record);	
	
	public SubscriptionPlan getFreePlan();

	public Long getPlanIdByCustomerId(Long customerId);
}
