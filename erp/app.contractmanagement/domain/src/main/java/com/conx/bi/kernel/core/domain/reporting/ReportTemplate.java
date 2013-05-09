//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vhudson-jaxb-ri-2.1-2 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2013.01.08 at 06:43:54 PM EST 
//


package com.conx.bi.kernel.core.domain.reporting;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.flowframe.kernel.common.mdm.domain.MultitenantBaseEntity;


@Entity
@Table(name = "birptreporttemplate")
public class ReportTemplate
    extends MultitenantBaseEntity
{
    protected String repositoryFolderId;
    protected String repositoryFileEntryId;

    /**
     * Gets the value of the repositoryFolderId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    @Basic
    @Column(name = "REPOSITORYFOLDERID", length = 255)
    public String getRepositoryFolderId() {
        return repositoryFolderId;
    }

    /**
     * Sets the value of the repositoryFolderId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepositoryFolderId(String value) {
        this.repositoryFolderId = value;
    }

    /**
     * Gets the value of the repositoryFileEntryId property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    @Basic
    @Column(name = "REPOSITORYFILEENTRYID", length = 255)
    public String getRepositoryFileEntryId() {
        return repositoryFileEntryId;
    }

    /**
     * Sets the value of the repositoryFileEntryId property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRepositoryFileEntryId(String value) {
        this.repositoryFileEntryId = value;
    }
}