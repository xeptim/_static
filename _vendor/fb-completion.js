// Funnelback link preview jquery plugin
// Author: Nicolas Guillaumin, Matt Sheppard
// Copyright Funnelback, 2010

(function($) {
 
    $.fn.fbcompletion = function(settings) {
        var config = {
            'collection'  : 'funnelback_documentation',
            'show'        : 10,
            'sort'        : 0,
            'delay'       : 0,
            'length'      : 3,
            'program'     : 'padre-qs.cgi',
            'format'      : 'simple',
            'enabled'     : 'disabled',
            'tmplId'      : 'fb-completion-tmpl',
            'profile'     : '_default',
            'zindex'      : 1000
        };
   
        if (settings) $.extend(config, settings);
    
        if (config.enabled != 'enabled' ) {
            return;
        }
    
        this.each(function() {
            var targetElement = this;

            // Compile jQuery template
            var compiledTmpl;
            if (jQuery().template) {
                if (jQuery('#'+config.tmplId).length > 0) {
                    compiledTmpl = jQuery('#'+config.tmplId).template();
                } else {
                    compiledTmpl = jQuery('<script>[Error: Template <tt>'+config.tmplId+'</tt> not found]</script>').template();
                }
            }
  
            $(targetElement).autocomplete( {
                appendTo: ($("#fb-queryform").length > 0) ? "#fb-queryform" : "body",
                source: function (request, response) {
                    jQuery.ajax({
                        type:     'GET',
                        url:      config.program
                                    + '?collection=' + config.collection
                                    + '&partial_query=' + request.term.replace(/ /g, '+')
                                    + '&show=' + config.show
                                    + '&sort=' + config.sort
                                    + '&alpha=' + config.alpha
                                    + '&fmt=' + ((config.format == 'simple') ? 'json' : 'json++') 
                                    + ((config.profile !== '') ? '&profile=' + config.profile : '' )
                        ,
                        dataType: 'jsonp',
                        error: function(xhr, textStatus, errorThrown) {
                           if (window.console) { 
                                console.log('Autocomplete error: ' + textStatus + ', ' + errorThrown);
                            }
                        },
                        success:  function(data) {
                            var responses = new Array();
                            var categorized = new Array();
                            var categoryLabels = new Array();
    
                            for (var i=0; i<data.length; i++) {
                                var out;
                                var suggestion = data[i];
    
                                if (suggestion == null) {
                                    continue;
                                }

                                if (typeof(suggestion) == 'string') {
                                    // Single string suggestion
                                    responses.push({
                                        label: suggestion,
                                        matchOn: request.term
                                    });
                                } else if (typeof(suggestion) == 'object') {
                                    if (suggestion.cat) {
                                        if ( ! categorized[suggestion.cat]) {
                                            categorized[suggestion.cat] = new Array();
                                            categoryLabels.push(suggestion.cat);
                                        }
                                        categorized[suggestion.cat].push({
                                            label: (suggestion.disp) ? suggestion.disp : suggestion.key,
                                            value: (suggestion.action_t == 'Q') ? suggestion.action: suggestion.key,
                                            extra: suggestion,
                                            matchOn: request.term
                                        });
                                    } else {
                                        responses.push({
                                            label: (suggestion.disp) ? suggestion.disp : suggestion.key,
                                            value: (suggestion.action_t == 'Q') ? suggestion.action : suggestion.key,
                                            extra: suggestion,
                                            matchOn: request.term
                                        });
                                    }
                                }
                            }

                            // Add categorized suggestions, with category header
                            for(var i=0; i<categoryLabels.length; i++) {
				var cLabel = categoryLabels[i];
                                responses.push({
                                    label: cLabel,
                                    category : true
                                });
                                for (var j=0; j<categorized[cLabel].length; j++) {
                                    responses.push(categorized[cLabel][j]);
                                }
                            }
                            response (responses);
                        }
                    });
                },

                open: function() {
                    jQuery(this).autocomplete('widget').css('z-index', config.zindex);
                    return false;
                },

                delay: config.delay,

                minLength: config.length,

                // focus: function(evt, ui) {}

                select: function(evt, ui) {
                    if (ui.item.extra) {
                        switch(ui.item.extra.action_t) {
                            case 'C':
                                eval(ui.item.extra.action);
                                break;
                            case 'U':
                                document.location = ui.item.extra.action;
                                break;
                            case undefined:
                            case '':
                                jQuery(this).attr('value', ui.item.value);
                                jQuery(this).context.form.submit();
                                break;
                            case 'Q':
                            default:
                                jQuery(this).attr('value', ui.item.extra.action);
                                jQuery(this).context.form.submit();
                        }
                    } else {
                        // Submit the form on select
                        jQuery(this).attr('value', ui.item.value);
                        jQuery(this).context.form.submit();
                    }
                    return false;
                }
            }).data( "autocomplete" )._renderItem = function( ul, item ) {
                var label;

                if ( item.category ) {
                    // Category header
                    return jQuery('<li><h2>' + item.label + '</h2></li>').appendTo(ul);
                } else if ( item.extra ) { // Complex suggestion
                    switch (item.extra.disp_t) {
                        case 'J':   // Json data
                            if (compiledTmpl) {
                                label = jQuery.tmpl(compiledTmpl, item.extra.disp).appendTo('<p></p>').parent().html();
                            } else {
                                label = '[Error: jQuery template plugin is unavailable]';
                            }
                            break;
                        case 'C':   // JS callback
                            label = eval(item.extra.disp);
                            break;
                        case 'T':   // Plain text
                            label = item.label.replace(new RegExp('('+item.matchOn+')', 'i'), '<strong>$1</strong>');
                            break;
                        case 'H':   // HTML
                                    // Label cannot be highlighted as there's no way
                                    // to skip HTML tags when running the regexp, possibly
                                    // corrupting them (ex: <img src="h<strong>t</strong>tp://...)
                        default:
                            label = item.label;
                    }
                } else {
                    // Single string suggestion
                    label = item.label.replace(new RegExp('('+item.matchOn+')', 'i'), '<strong>$1</strong>');
                }
                return jQuery('<li></li>')
                    .data( 'item.autocomplete', item)
                    .append( '<a>' + label + '</a>' )
                    .appendTo(ul);
            };
        });
        return this;
    };
 
 })(jQuery);

