<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderPath(pageContext, folder.id)}"/>
<c:url var="url" value="${empty base ? 'zmain' : base}">
    <c:param name="sfi" value="${folder.id}"/>
    <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
</c:url>
<div class='Folders ${param.id eq folder.id ? 'StatusWarning' : ''} list-row${folder.hasUnread ? '-unread' : ''}'
     <c:if test="${types ne 'cal'}">onclick='return zClickLink("FLDR${folder.id}")'</c:if>>
    <div class="table">
        <div class="table-row">
            <c:if test="${types eq 'cal'}">
    <span class="table-cell left" width="1%">    
    <input type="checkbox" onchange="fetchIt('?${folder.isCheckedInUI ? 'un' : ''}check=${folder.id}&st=cals');"
           value="${folder.id}" name="calid" ${folder.isCheckedInUI ? 'checked=checked':''}>
    </span>
            </c:if>
    <span class='table-cell left' onclick='return zClickLink("FLDR${folder.id}")' width="94%">
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}">
            <span class="SmlIcnHldr Fldr${folder.type}">&nbsp;</span>
            ${fn:escapeXml(zm:truncateFixed(label,30,true))}
            <c:if test="${folder.hasUnread}">&nbsp;(${folder.unreadCount})</c:if>
        </a>
    </span>
            <c:if test="${!folder.isSystemFolder}">
                <c:choose>
                    <c:when test="${folder.isSearchFolder}">
                        <c:set var="what" value="Search"/>                        
                    </c:when>
                    <c:otherwise>
                        <c:choose>
                            <c:when test="${param.st eq 'folders'}">
                                <c:set var="what" value="Folder"/>
                            </c:when>
                            <c:when test="${param.st eq 'ab'}">
                                <c:set var="what" value="AB"/>
                            </c:when>
                            <c:when test="${param.st eq 'cals'}">
                                <c:set var="what" value="Cal"/>
                            </c:when>
                            <c:when test="${param.st eq 'notebooks'}">
                                <c:set var="what" value="NB"/>
                            </c:when>
                            <c:when test="${param.st eq 'briefcases'}">
                                <c:set var="what" value="BC"/>
                            </c:when>
                        </c:choose>
                    </c:otherwise>
                </c:choose>
                <span class="table-cell right" width="5%">
                    <a class="SmlIcnHldr Edit" href="?st=${param.st}&show${what}Create=1&${folder.isSearchFolder ? 's' : ''}id=${folder.id}">&nbsp;</a></span>
            </c:if>
        </div>
    </div>
</div>
