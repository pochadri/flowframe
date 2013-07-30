/*
 * Copyright (c) 2009 Sergey Smirnov, Artem Polyvyanyy
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE. 
 */

package de.hpi.bpt.epc.aml;

import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Node;

/**
 * 
 * 
 * @author Sergey Smirnov, Artem Polyvyanyy
 * @version 1.0
 */
public class AMLMetaInfo {
	
	private Map<Node, Node> fonts;
	
	private HashMap<String, AMLEPCTextNote> textNotes;
	
	public AMLMetaInfo() {
		this.fonts = new HashMap<Node, Node>();
		this.textNotes = new HashMap<String, AMLEPCTextNote>();
	}

	public HashMap<String, AMLEPCTextNote> getTextNotes() {
		return textNotes;
	}

	public void setTextNotes(HashMap<String, AMLEPCTextNote> textNotes) {
		this.textNotes = textNotes;
	}

	public Map<Node, Node> getFonts() {
		return fonts;
	}

	public void setFonts(Map<Node, Node> fonts) {
		this.fonts = fonts;
	}

}