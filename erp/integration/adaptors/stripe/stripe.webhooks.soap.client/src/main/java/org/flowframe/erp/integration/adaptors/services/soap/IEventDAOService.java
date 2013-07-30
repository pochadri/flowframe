package org.flowframe.erp.integration.adaptors.services.soap;

import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.namespace.QName;
import javax.xml.ws.WebEndpoint;
import javax.xml.ws.WebServiceClient;
import javax.xml.ws.WebServiceFeature;
import javax.xml.ws.Service;

/**
 * This class was generated by Apache CXF 2.5.2
 * 2013-06-20T13:48:00.910-04:00
 * Generated source version: 2.5.2
 * 
 */
@WebServiceClient(name = "IEventDAOService", 
                  wsdlLocation = "http://production2.bconv.com:8182/cxf/org/flowframe/erp/integration/adaptors/stripe/services/IEventDAOService?wsdl",
                  targetNamespace = "http://services.stripe.adaptors.integration.erp.flowframe.org/") 
public class IEventDAOService extends Service {

    public final static URL WSDL_LOCATION;

    public final static QName SERVICE = new QName("http://services.stripe.adaptors.integration.erp.flowframe.org/", "IEventDAOService");
    public final static QName IEventDAOServicePort = new QName("http://services.stripe.adaptors.integration.erp.flowframe.org/", "IEventDAOServicePort");
    static {
        URL url = null;
        try {
            url = new URL("http://production2.bconv.com:8182/cxf/org/flowframe/erp/integration/adaptors/stripe/services/IEventDAOService?wsdl");
        } catch (MalformedURLException e) {
            java.util.logging.Logger.getLogger(IEventDAOService.class.getName())
                .log(java.util.logging.Level.INFO, 
                     "Can not initialize the default wsdl from {0}", "http://production2.bconv.com:8182/cxf/org/flowframe/erp/integration/adaptors/stripe/services/IEventDAOService?wsdl");
        }
        WSDL_LOCATION = url;
    }

    public IEventDAOService(URL wsdlLocation) {
        super(wsdlLocation, SERVICE);
    }

    public IEventDAOService(URL wsdlLocation, QName serviceName) {
        super(wsdlLocation, serviceName);
    }

    public IEventDAOService() {
        super(WSDL_LOCATION, SERVICE);
    }
    

    /**
     *
     * @return
     *     returns IEventDAOServicePortType
     */
    @WebEndpoint(name = "IEventDAOServicePort")
    public IEventDAOServicePortType getIEventDAOServicePort() {
        return super.getPort(IEventDAOServicePort, IEventDAOServicePortType.class);
    }

    /**
     * 
     * @param features
     *     A list of {@link javax.xml.ws.WebServiceFeature} to configure on the proxy.  Supported features not in the <code>features</code> parameter will have their default values.
     * @return
     *     returns IEventDAOServicePortType
     */
    @WebEndpoint(name = "IEventDAOServicePort")
    public IEventDAOServicePortType getIEventDAOServicePort(WebServiceFeature... features) {
        return super.getPort(IEventDAOServicePort, IEventDAOServicePortType.class, features);
    }

}