/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.toolbar_MyToolbar =
    [
        ['Bold','Italic','Strike'],
        ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
        ['Format'],
        ['Smiley','SpecialChar','PageBreak']
        
    ];
    config.disableObjectResizing = true;
    config.contentsCss =['/js/ckeditor/contents.css'];
    config.smiley_path = '/js/ckeditor/plugins/smiley/qqimages/';
    config.smiley_images = [
    '0.gif','1.gif','2.gif','3.gif','4.gif','5.gif','6.gif','7.gif','8.gif',
    '9.gif','10.gif','11.gif','12.gif','13.gif','14.gif','15.gif','16.gif','17.gif',
    '18.gif','19.gif','20.gif','21.gif','22.gif','23.gif','24.gif','25.gif','26.gif',
    '27.gif','28.gif','29.gif','30.gif','31.gif','32.gif','33.gif','34.gif','35.gif',
    '36.gif','37.gif','38.gif','39.gif'];
    
};
