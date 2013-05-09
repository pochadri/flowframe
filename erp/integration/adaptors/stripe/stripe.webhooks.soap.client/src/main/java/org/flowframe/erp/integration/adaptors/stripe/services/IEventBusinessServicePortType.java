package org.flowframe.erp.integration.adaptors.stripe.services;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

/**
 * This class was generated by Apache CXF 2.5.2
 * 2013-05-08T13:24:53.447-04:00
 * Generated source version: 2.5.2
 * 
 */
@WebService(targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", name = "IEventBusinessServicePortType")
@XmlSeeAlso({ObjectFactory.class})
public interface IEventBusinessServicePortType {

    @RequestWrapper(localName = "markActive", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.MarkActive")
    @WebMethod
    @ResponseWrapper(localName = "markActiveResponse", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.MarkActiveResponse")
    public void markActive(
        @WebParam(name = "arg0", targetNamespace = "")
        java.lang.String arg0
    ) throws Exception_Exception;

    @WebResult(name = "return", targetNamespace = "")
    @RequestWrapper(localName = "processEvent", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.ProcessEvent")
    @WebMethod
    @ResponseWrapper(localName = "processEventResponse", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.ProcessEventResponse")
    public int processEvent(
        @WebParam(name = "arg0", targetNamespace = "")
        java.lang.String arg0
    );

    @RequestWrapper(localName = "markInactive", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.MarkInactive")
    @WebMethod
    @ResponseWrapper(localName = "markInactiveResponse", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.MarkInactiveResponse")
    public void markInactive(
        @WebParam(name = "arg0", targetNamespace = "")
        java.lang.String arg0
    ) throws Exception_Exception;

    @RequestWrapper(localName = "greenLightEvent", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.GreenLightEvent")
    @WebMethod
    @ResponseWrapper(localName = "greenLightEventResponse", targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/", className = "org.flowframe.erp.integration.adaptors.stripe.services.GreenLightEventResponse")
    public void greenLightEvent(
        @WebParam(name = "arg0", targetNamespace = "")
        java.lang.String arg0
    ) throws Exception_Exception;
}