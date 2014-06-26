/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('autosave', function(editor) {
	var settings = editor.settings, LocalStorage = tinymce.util.LocalStorage, prefix, started;

	prefix = settings.autosave_prefix || 'tinymce-autosave-{path}{query}-{id}-';
	prefix = prefix.replace(/\{path\}/g, document.location.pathname);
	prefix = prefix.replace(/\{query\}/g, document.location.search);
	prefix = prefix.replace(/\{id\}/g, editor.id);

	function parseTime(time, defaultTime) {
		var multipels = {
			s: 1000,
			m: 60000
		};

		time = /^(\d+)([ms]?)$/.exec('' + (time || defaultTime));

		return (time[2] ? multipels[time[2]] : 1) * parseInt(time, 10);
	}

	function hasDraft() {
		var time = parseInt(LocalStorage.getItem(prefix + "time"), 10) || 0;

		if (new Date().getTime() - time > settings.autosave_retention) {
			removeDraft(false);
			return false;
		}

		return true;
	}

	function removeDraft(fire) {
		LocalStorage.removeItem(prefix + "draft");
		LocalStorage.removeItem(prefix + "time");

		if (fire !== false) {
			editor.fire('RemoveDraft');
		}
	}

	function storeDraft() {
		if (!isEmpty() && editor.isDirty()) {
			LocalStorage.setItem(prefix + "draft", editor.getContent({format: 'raw', no_events: true}));
			LocalStorage.setItem(prefix + "time", new Date().getTime());
			editor.fire('StoreDraft');
		}
	}

	function restoreDraft() {
		if (hasDraft()) {
			editor.setContent(LocalStorage.getItem(prefix + "draft"), {format: 'raw'});
			editor.fire('RestoreDraft');
		}
	}

	function startStoreDraft() {
		if (!started) {
			setInterval(function() {
				if (!editor.removed) {
					storeDraft();
				}
			}, settings.autosave_interval);

			started = true;
		}
	}

	settings.autosave_interval = parseTime(settings.autosave_interval, '30s');
	settings.autosave_retention = parseTime(settings.autosave_retention, '20m');

	function postRender() {
		var self = this;

		self.disabled(!hasDraft());

		editor.on('StoreDraft RestoreDraft RemoveDraft', function() {
			self.disabled(!hasDraft());
		});

		startStoreDraft();
	}

	function restoreLastDraft() {
		editor.undoManager.beforeChange();
		restoreDraft();
		removeDraft();
		editor.undoManager.add();
	}

	editor.addButton('restoredraft', {
		title: 'Restore last draft',
		onclick: restoreLastDraft,
		onPostRender: postRender
	});

	editor.addMenuItem('restoredraft', {
		text: 'Restore last draft',
		onclick: restoreLastDraft,
		onPostRender: postRender,
		context: 'file'
	});

	// Internal unload handler will be called before the page is unloaded
	function beforeUnloadHandler() {
		var msg;

		tinymce.each(tinymce.editors, function(editor) {
			// Store a draft for each editor instance
			if (editor.plugins.autosave) {
				editor.plugins.autosave.storeDraft();
			}

			// Setup a return message if the editor is dirty
			if (!msg && editor.isDirty() && editor.getParam("autosave_ask_before_unload", true)) {
				msg = editor.translate("You have unsaved changes are you sure you want to navigate away?");
			}
		});

		return msg;
	}

	function isEmpty(html) {
		var forcedRootBlockName = editor.settings.forced_root_block;

		html = tinymce.trim(typeof(html) == "undefined" ? editor.getBody().innerHTML : html);

		return html === '' || new RegExp(
			'^<' + forcedRootBlockName + '[^>]*>((\u00a0|&nbsp;|[ \t]|<br[^>]*>)+?|)<\/' + forcedRootBlockName + '>|<br>$', 'i'
		).test(html);
	}

	if (editor.settings.autosave_restore_when_empty !== false) {
		editor.on('init', function() {
			if (hasDraft() && isEmpty()) {
				restoreDraft();
			}
		});

		editor.on('saveContent', function() {
			removeDraft();
		});
	}

	window.onbeforeunload = beforeUnloadHandler;

	this.hasDraft = hasDraft;
	this.storeDraft = storeDraft;
	this.restoreDraft = restoreDraft;
	this.removeDraft = removeDraft;
	this.isEmpty = isEmpty;
});