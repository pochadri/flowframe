//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2012.12.04 at 12:54:59 PM EST 
//


package org.pentaho.kettle.schema.kettle.trans;

import javax.xml.bind.annotation.XmlRegistry;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the org.pentaho.kettle.schema.kettle.trans package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {


    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: org.pentaho.kettle.schema.kettle.trans
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link Transformation.Step.Fields }
     * 
     */
    public Transformation.Step.Fields createTransformationStepFields() {
        return new Transformation.Step.Fields();
    }

    /**
     * Create an instance of {@link Transformation }
     * 
     */
    public Transformation createTransformation() {
        return new Transformation();
    }

    /**
     * Create an instance of {@link Transformation.Step.Partitioning }
     * 
     */
    public Transformation.Step.Partitioning createTransformationStepPartitioning() {
        return new Transformation.Step.Partitioning();
    }

    /**
     * Create an instance of {@link Transformation.Step.Fields.Field }
     * 
     */
    public Transformation.Step.Fields.Field createTransformationStepFieldsField() {
        return new Transformation.Step.Fields.Field();
    }

    /**
     * Create an instance of {@link Transformation.Step }
     * 
     */
    public Transformation.Step createTransformationStep() {
        return new Transformation.Step();
    }

    /**
     * Create an instance of {@link Transformation.Info }
     * 
     */
    public Transformation.Info createTransformationInfo() {
        return new Transformation.Info();
    }

    /**
     * Create an instance of {@link Transformation.Info.Log }
     * 
     */
    public Transformation.Info.Log createTransformationInfoLog() {
        return new Transformation.Info.Log();
    }

    /**
     * Create an instance of {@link Transformation.Order }
     * 
     */
    public Transformation.Order createTransformationOrder() {
        return new Transformation.Order();
    }

    /**
     * Create an instance of {@link Transformation.Info.Maxdate }
     * 
     */
    public Transformation.Info.Maxdate createTransformationInfoMaxdate() {
        return new Transformation.Info.Maxdate();
    }

    /**
     * Create an instance of {@link Transformation.Order.Hop }
     * 
     */
    public Transformation.Order.Hop createTransformationOrderHop() {
        return new Transformation.Order.Hop();
    }

    /**
     * Create an instance of {@link Transformation.Step.Fields.Meta }
     * 
     */
    public Transformation.Step.Fields.Meta createTransformationStepFieldsMeta() {
        return new Transformation.Step.Fields.Meta();
    }

    /**
     * Create an instance of {@link Transformation.Step.GUI }
     * 
     */
    public Transformation.Step.GUI createTransformationStepGUI() {
        return new Transformation.Step.GUI();
    }

    /**
     * Create an instance of {@link Transformation.Step.Remotesteps }
     * 
     */
    public Transformation.Step.Remotesteps createTransformationStepRemotesteps() {
        return new Transformation.Step.Remotesteps();
    }

}
