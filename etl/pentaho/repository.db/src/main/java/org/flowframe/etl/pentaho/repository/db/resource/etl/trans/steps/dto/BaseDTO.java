package org.flowframe.etl.pentaho.repository.db.resource.etl.trans.steps.dto;

import flexjson.JSONSerializer;

import java.io.Serializable;

/**
 * Created with IntelliJ IDEA.
 * User: Mduduzi
 * Date: 8/21/13
 * Time: 6:30 PM
 * To change this template use File | Settings | File Templates.
 */
abstract public class BaseDTO implements Serializable {

    public String toJSON() {
        JSONSerializer serializer = new JSONSerializer();
        return serializer.serialize(this);
    }
}
