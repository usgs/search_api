/**
 * @file    Geocoder JS.
 * @summary Geocoder: A JavaScript API for creating a location search control in a web page.
 * @author  Joseph Vrabel, U.S. Geological Survey <jvrabel@usgs.gov>
 * @version 1.0.0
 * @preserve
 */
/* globals gc, L */


/**
 * @namespace   gc
 * @description API namespace object.
 */
window.gc = window.gc || {};


/**
 * @method      create
 * @description Create a new geocoder control in a DOM element.
 * @param       {string} id           DOM element ID, required.
 * @param       {object} [options={}] Options.
 * @return      {object} The control object.
 * @example
 *   // usage: const control = gc.create( <string>id, <Geocoder options>options )[.methods(...)];
 *   const control = gc.create('ControlId', {
 *       states: 'tx ok',
 *       include: 'gnis usgs-sw'
 *   }).value('07300000');
 * @since 1.0.0
 */
gc.create = (id, options = {}) => {

    //.......................................
    // options
    //.......................................
    const defaultOptions = {

        //.......................................
        // geographic area
        //.......................................

        /**
         * @property {array} bounds
         * @description
         *   Restrict geographic area to a bounding box.
         *   Array of decimal degree numbers formatted as `[latMin, lonMin, latMax, lonMax]` or `[[latMin, lonMin], [latMax, lonMax]]`.
         *   No restriction is applied when `undefined`.
         * @example
         *   bounds: [40, -95, 45, -90]     // bounding box
         *   bounds: [[40, -95], [45, -90]] // same as above
         *   bounds: [40, -180, 45, 180]    // locations between 45N and 40N
         *   bounds: [-90, -95, 90, 180]    // locations east of 95W
         * @since 1.0.0
         */
        bounds: undefined, // no restriction

        /**
         * @property {string} states
         * @description
         *   Restrict geographic area to one or more U.S. states and/or territories.
         *   A space-separated string of 2-character abbreviation(s).
         *   The following are available in addition to the 50 states:
         *     'as' American Samoa                  'mp' Northern Mariana Island
         *     'dc' District of Columbia            'pr' Puerto Rico
         *     'fm' Federated States of Micronesia  'pw' Palau
         *     'gu' Guam                            'um' United States Minor Outlying Islands
         *     'mh' Marshall Islands                'vi' U.S. Virgin Islands
         *   The following keywords can be used as shortcuts:
         *     '48'   The 48 contiguous states plus 'dc'
         *     '50'   The 50 states plus 'dc'
         *     'usgs' States and territories USGS maintains real-time water data gages (50 states plus 'dc', 'gu', 'pr', and 'vi')
         *   No restriction is applied when `undefined`.
         * @example
         *   states: 'tx'       // texas
         *   states: 'fl pr vi' // florida, puerto rico, us virgin islands
         *   states: '48'       // lower 48 states + dc
         *   states: '50'       // 50 states plus 'dc'
         *   states: 'usgs'     // where usgs maintains realtime water data gages
         * @since 1.0.0
         */
        states: undefined, // no restriction

        //.......................................
        // location types
        //.......................................

        /**
         * @property {string} include
         * @description
         *   Space-separated location types to include in the suggestion menu.
         *   Can contain one or more of the following:
         *     - 'gnis'     Geographic Names Information System (GNIS) places
         *     - 'huc'      2-, 4-, 6-, 8-, 10-, and 12-digit hydrologic unit codes
         *     - 'huc-N'    Individual N-digit huc, where N is one of 2, 4, 6, 8, 10, 12.
         *     - 'postal'   5-digit postal (zip) codes
         *     - 'state'    U.S. state names and abbreviations
         *     - 'usgs'     USGS realtime station numbers, names, and NWS AHPS id for USGS stations
         *     - 'usgs-at','usgs-at','usgs-at','usgs-at','usgs-at' USGS realtime station numbers and names by site type
         *     - 'usgs-nws' NWS AHPS id for USGS stations
         * @example
         *   include: 'gnis huc usgs' // gnis places; all hucs; all usgs realtime numbers, names, and ahps id for usgs sites
         *   include: 'gnis huc-4 huc-6 huc-8 usgs-gw usgs-sp usgs-nws' // gnis places; huc-4,6,8 only; usgs realtime numbers and names for groundwater and springs only, ahps id for usgs sites
         * @see [GNIS information     ]{@link https://www.usgs.gov/core-science-systems/ngp/board-on-geographic-names/domestic-names}
         * @see [HUC  information     ]{@link https://water.usgs.gov/GIS/huc.html}
         * @see [USGS site information]{@link https://waterdata.usgs.gov/nwis}
         * @since 1.0.0
         */
        include: 'gnis postal state',

        //.......................................
        // appearance and behavior
        //.......................................

        /**
         * @property    {string} controlClassName
         * @description Space-separated class(es) to add to the control container.
         * @since       1.0.0
         */
        controlClassName: '',

        /**
         * @property    {string} className
         * @description Space-separated class(es) to add to the control and menu containers.
         * @since       1.0.0
         */
        className: '',

        /**
         * @property    {number} maxSuggestions
         * @description Maximum number of items to display in the suggestion menu. A built-in maximum of 200 supercedes this user option.
         * @since       1.0.0
         */
        maxSuggestions: 50,

        /**
         * @property    {string} menuClassName
         * @description Space-separated class(es) to add to the suggestion menu container.
         * @since       1.0.0
         */
        menuClassName: '',

        /**
         * @property    {string|number} menuHeight
         * @description Maximum menu height as a CSS string. Pixels assumed when a number. Set undefined to use the maximum available screen space.
         * @example
         *   menuHeight: '40rem'   // css string
         *   menuHeight: '640px'   // pixels
         *   menuHeight: 640       // pixels assumed
         *   menuHeight: undefined // maximum available space
         * @since 1.0.0
         */
        menuHeight: '40rem',

        /**
         * @property    {number} minCharacters
         * @description Minimum number of typed characters required before finding location suggestions.
         * @since       1.0.0
         */
        minCharacters: 2,

        /**
         * @property    {string} placeholder
         * @description Text field placeholder (hint shown when no text is entered).
         * @since       1.0.0
         */
        placeholder: 'Find a place',

        /**
         * @property    {string} size
         * @description Size, one of 'sm' (small), 'md' (medium), or 'lg' (large). The `width` option takes precedence over this.
         * @see         width option.
         * @since       1.0.0
         */
        size: 'md',

        /**
         * @property    {string} title
         * @description Text input title attribute (hover text).
         * @since       1.0.0
         */
        title: '',

        /**
         * @property {string|number} width
         * @description Control width as a CSS string. Pixels assumed when a number. Set undefined to use a pre-determined width based on the `size` option.
         * @example
         *   width: '15rem'   // css string
         *   width: '240px'   // pixels
         *   width: 240       // pixels assumed
         *   width: undefined // size option used
         * @see size option.
         * @since 1.0.0
         */
        width: undefined,

        //.......................................
        // event callbacks
        //.......................................

        /**
         * @property {function} onSelect
         * @description
         *   Function to execute when a suggestion in the menu is selected.
         *   Function can have one argument to access the control object.
         *   Access the selected location using the object's `getSelected()` method.
         * @example
         *   // do something with the selected location
         *   onSelect: ctrl => {
         *      const feature = ctrl.getSelected(); // geojson point feature
         *      alert( 'Do something with the selected location:\n' + JSON.stringify(feature, null, 4) );
         *   }
         * 
         *   // leaflet: go to location and open popup with label and type
         *   onSelect: ctrl => {
         *       const p = ctrl.getSelected().properties;
         *       map.fitBounds(p.Bounds, {
         *           maxZoom: 12
         *       }).openPopup( `<b>${p.Label}</b><br>${p.Type}`, [p.Latitude, p.Longitude]);
         *   }
         * @see control.getSelected method
         * @since 1.0.0
         */
        onSelect: undefined,

        /**
         * @property {function} onSuggest
         * @description
         *   Function to execute when the suggestion menu changes.
         *   Function can have one argument to access the control object.
         *   Access the menu suggestions using the object's `getSuggestions()` method.
         *   Triggered when new suggestions are displayed and when the menu closes.
         * @example
         *   // leaflet: show menu suggestions on the map
         *   onSuggest: ctrl => {
         *       ctrl.suggestionLayer = ctrl.suggestionLayer || L.geoJson().bindTooltip(layer => layer.feature.properties.Label); // tooltips available leaflet 1.x+
         *       ctrl.suggestionLayer.clearLayers().addData(ctrl.getSuggestions());
         *       const bounds = ctrl.suggestionLayer.getBounds();
         *       if (bounds.isValid()) {
         *           map.fitBounds(bounds.pad(0.1)).addLayer(ctrl.suggestionLayer);
         *       } else {
         *           map.removeLayer(ctrl.suggestionLayer);
         *       }
         *   }
         * @see control.getSuggestions method
         * @since 1.0.0
         */
        onSuggest: undefined

    };

    /** @private create control object */
    if(!document.getElementById(id)) return console.warn(`[geocoder] USAGE ERROR: Cannot create, element with id="${id}" does not exist.`);
    if(Object.keys(gc._controls || {}).includes(id)) return console.warn(`[geocoder] USAGE ERROR: Cannot create, a geocoder control already exists in element id="${id}".`);
    const control = {
        id: id
    };

    //.......................................
    // methods
    //.......................................

    /**
     * @method getSelected
     * @description
     *   Get GeoJSON point feature of the last selected location suggestion.
     *   Location information is set as feature properties.
     *   Returns undefined when no locations have been selected yet.
     * @return {object|undefined} GeoJSON of the last selected location, undefined when none.
     * @example
     *   const feature = control.getSelected();
     * @see @see [GeoJSON information]{@link https://en.wikipedia.org/wiki/GeoJSON}
     * @since 1.0.0
     */
    control.getSelected = () => control._selected;

    /**
     * @method getSuggestions
     * @description
     *   Get the locations shown in the suggestions menu as a GeoJSON feature collection of point features.
     *   Location information is set as feature properties.
     *   The feature collection is empty when the menu is closed.
     * @return {object} GeoJSON feature collection of most recently found location suggestions.
     * @example
     *   const featureCollection = control.getSuggestions();
     * @since 1.0.0
     */
    control.getSuggestions = () => control._suggestions;

    /**
     * @method setOptions
     * @description
     *   Set control options.
     *   Input option(s) are merged into existing options.
     *   Can be called at any time to update the control.
     *   Both `name,value` and `object` input formats are supported (see examples).
     * @param  {string|object} arg1   The name of a single option, or an object of options.
     * @param  {value |omit  } [arg2] The option value when the 1st argument is an option name, omit when the 1st argument is an object.
     * @return {object} The control object.
     * @example
     *   control.setOptions('states', 'tx');  // set a single option (name,value format)
     *   control.setOptions({ states:'tx' }); // set the same option (object format)
     *   control.setOptions({ states:'tx ok', size:'lg', placeholder:'Find location' }); // set multiple options (object format)
     * @since 1.0.0
     */
    control.setOptions = (...args) => {
        // handle input syntax: (obj) or (name,value) pair
        const newOptions = args.length <= 1 ? args[0] : {
            [args[0]]: args[1]
        };
        if(typeof newOptions !== 'object') {
            console.warn('[geocoder] USAGE ERROR: "setOptions" input must be an object of options or an option (name,value) pair, options not changed.');
            return control;
        }
        // report and delete unrecognized options
        Object.keys(newOptions).filter(name => !Object.keys(defaultOptions).includes(name)).forEach(name => {
            console.warn(`[geocoder] USAGE WARNING: Unrecognized option "${name}" ignored.`);
            delete newOptions[name];
        });
        // merge new options
        control.options = Object.assign(control.options || defaultOptions, newOptions);
        // set dom element options
        control._element.control.className = `gc-control gc-${control.options.size} ${control.options.className} ${control.options.controlClassName}`;
        control._element.control.style.width = !control.options.width ? null : isNaN(Number(control.options.width)) ? control.options.width : control.options.width + 'px';
        control._element.input.placeholder = control.options.placeholder || '';
        control._element.input.title = control.options.title;
        control._element.menu.className = `gc-menu gc-${control.options.size} ${control.options.className} ${control.options.menuClassName}`;
        // clear and return
        control._cache = {};
        control._suggestions = {
            type: "FeatureCollection",
            features: []
        };
        control._selected = undefined;
        return control;
    };

    /**
     * @method      enable
     * @description Set or get the enable state.
     * @param       {boolean|undefined} [enable=undefined] Whether to enable (true), disable (false), or get the enable state (undefined).
     * @return      {object|boolean} The control object when setting, the state when getting.
     * @example
     *   control.enable(true);              // enable
     *   control.enable(false);             // disable
     *   const state = control.enable();    // get state
     *   control.enable(!control.enable()); // toggle state
     * @since 1.0.0
     */
    control.enable = (enable = undefined) => {
        if(enable === undefined) return !control._element.input.disabled; // get
        control._element.input.disabled = !enable; // set
        control._element.control.classList.toggle('gc-disabled', !enable);
        return control;
    };

    /**
     * @method      visible
     * @description Set or get visibility.
     * @param       {boolean|undefined} [show=undefined] Whether to show (true), hide (false), or get the visibility state (undefined).
     * @return      {object|boolean} The control object when setting, the state when getting.
     * @example
     *   control.visible(true);               // show
     *   control.visible(false);              // hide
     *   const state = control.visible();     // get state
     *   control.visible(!control.visible()); // toggle state
     * @since 1.0.0
     */
    control.visible = (show = undefined) => {
        if(show === undefined) return !control._element.control.classList.contains('gc-hidden'); // get
        control._element.control.classList.toggle('gc-hidden', !show); // set
        return control;
    };

    /**
     * @method      value
     * @description Set or get the input text. No events are triggered when setting.
     * @param       {string|undefined} [text=undefined] Input text to set. Undefined to get current text.
     * @return      {object|string} The control object when setting, the text when getting.
     * @example
     *   control.value('grand canyon'); // set
     *   const text = control.value();  // get
     * @since 1.0.0
     */
    control.value = (text = undefined) => {
        if(text === undefined) return control._element.input.value; // get
        control._element.input.value = text; // set
        return control;
    };

    /**
     * @method      trigger
     * @description Trigger one or more API event callbacks. Multiple events are triggered in the order provided.
     * @param       {string} names Space-separated callback names ('onSelect','onSuggest').
     * @return      {object} The control object.
     * @example
     *   control.trigger('onSelect'); // trigger single api event
     *   control.trigger('onSelect onSuggest'); // trigger multiple api events in this order
     * @since 1.0.0
     */
    control.trigger = (names = '') => {
        names.split(/\s+/u).filter(name => typeof control.options[name] === 'function').forEach(name =>
            control.options[name](control)
        );
        return control;
    };

    /**
     * @method      destroy
     * @description Remove the control from the document and clean up resources. The control object is no longer usable after it is destroyed.
     * @return      {undefined} Nothing.
     * @example
     *   control.destroy();
     * @since 1.0.0
     */
    control.destroy = () => {
        control._fetchAbortController.abort(); //         clear service requests
        control._eventAbortController.abort(); //         clear event listeners
        control._element.control.remove(); //             remove control elements
        control._element.menu.remove(); //                remove menu elements
        delete gc._controls[control.id]; //               remove global api object
        for(const key in control) delete control[key]; // clear control object
    };

    /** @private create, set options, and return */
    return gc._create(control).setOptions(options);
};


/**
 * @method      get
 * @description Get an existing control object by element id.
 * @param       {string} id The control's DOM element ID, required.
 * @return      {object|undefined} The control object. Undefined when none exists with the specified id.
 * @example
 *   const control = gc.get('ControlId').enable(false);
 * @since 1.0.0
 */
gc.get = id => (gc._controls || {})[id];


/**
 * @property    {string READONLY} version
 * @description API version.
 * @since 1.0.0
 */
gc.version = '1.0.0';


/**
 * @property    {string READONLY} homepage
 * @description API home page. Visit the home page for additional resources including examples, documentation, service endpoints, and access to other versions.
 * @since 1.0.0
 */
gc.homepage = 'https://dashboard.waterdata.usgs.gov/api/geocoder/';


//===========================================
// private configuration
//===========================================

/**
 * @namespace   gc._config
 * @description Configuration parameters.
 * @private @ignore
 */
gc._config = {

    // debounce wait time between successive locate operations, milliseconds
    debounceMs: 250,

    // score threshold for secondary service (0-100%, candidates scoring below this rejected)
    minScore: 80,

    // number of decimal places for reporting lat-lon coordinates
    nCoordDecimals: 6,

    // primary (api) geocoding service - api [major.minor] version uses service [major.x]
    service1: 'https://dashboard.waterdata.usgs.gov/service/geocoder/get/location/' + gc.version.replace(/\.[0-9]+$/u, ''), // api v1.2.3 calls service v1.2

    // secondary (3rd party fallback) geocoding service
    // great list of many geocoding services: https://geoservices.tamu.edu/Services/Geocode/OtherGeocoders/
    service2: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates',

    // svg icons
    svg: {
        magnifier: '<svg viewBox="0 0 48 48"><path d="M 20.5 6 C 12.5 6 6 12.5 6 20.5 C 6 28.5 12.5 35 20.5 35 C 23.8 35 26.8 33.9 29.2 32.1 L 38.6 ' +
            '41.4 A 2 2 0 1 0 41.4 38.6 L 32 29.2 C 33.9 26.8 35 23.8 35 20.5 C 35 12.5 28.5 6 20.5 6 z M 20.5 10 C 26.3 10 31 14.7 31 20.5 C 31 23.3 ' +
            '29.9 25.8 28.1 27.7 A 2 2 0 0 0 27.7 28.1 C 25.8 29.9 23.3 31 20.5 31 C 14.7 31 10 26.3 10 20.5 C 10 14.7 14.7 10 20.5 10 z"/></svg>'
        //...can have more to symbolize suggestion map markers by type...
    },

    // total service timeout (api and secondary), milliseconds
    timeoutMs: 7000
};


//===========================================
// private methods
//===========================================

/**
 * @method      _create
 * @description Create and setup.
 * @param       {object} control The control object.
 * @return      {object} The control object.
 * @private @ignore
 */
gc._create = control => {

    // add object to api for global access by id
    gc._controls = gc._controls || {};
    gc._controls[control.id] = control;

    // create abort controllers for events and service requests
    control._eventAbortController = new window.AbortController();
    control._fetchAbortController = new window.AbortController();

    // create control in specified element
    document.getElementById(control.id).innerHTML = /*html*/
        `<div class="gc-control">
            <div class="gc-icon"> ${gc._config.svg.magnifier} </div>
            <input type="search" class="gc-input" value="" spellcheck="false">
            <div class="gc-spinner">
                <div></div>
            </div>
        </div>`;

    // helpers for accessing elements
    control._element = {
        /* beautify ignore:start */
        control : document.querySelector(`#${control.id} .gc-control`),
        icon    : document.querySelector(`#${control.id} .gc-icon`   ),
        input   : document.querySelector(`#${control.id} .gc-input`  ),
        spinner : document.querySelector(`#${control.id} .gc-spinner`),
        menu    : document.createElement('div'),
        /* beautify ignore:end */
    };

    // add menu to body
    control._element.menu.classList.add('gc-menu');
    document.body.appendChild(control._element.menu);

    //.......................................
    // methods
    //.......................................

    /**
     * @method _positionMenu Position menu on screen.
     * @return {object} The control object.
     * @private @ignore
     */
    control._positionMenu = () => {
        if(!control._element.menu.innerHTML) return control; // do nothing when menu empty
        const rect = control._element.control.getBoundingClientRect();
        const above = rect.top;
        const below = window.innerHeight - rect.bottom;
        const scrollX = (document.fullscreenElement || document.documentElement).scrollLeft;
        const scrollY = (document.fullscreenElement || document.documentElement).scrollTop;
        control._element.menu.style.cssText =
            `width:      ${ control._element.control.offsetWidth }px;
             left:       ${ rect.left + scrollX }px;
             top:        ${ below >= above ?                                          rect.bottom + scrollY  + 'px' : null };
             bottom:     ${ below <  above ? document.documentElement.clientHeight - (rect.top    + scrollY) + 'px' : null };
             box-shadow: 0 ${ below >= above ? '5px':'-5px' } 10px 0 rgba(0,0,0,0.3);`;
        // set height
        const items = control._element.menu.querySelector('.gc-menu-items');
        const maxHeight = 0.9 * Math.max(above, below); // max available
        if(control.options.menuHeight) { // option specified - use it
            items.style.maxHeight = /\D/u.test(control.options.menuHeight) ? control.options.menuHeight : control.options.menuHeight + 'px'; // css string or px
            if(items.offsetHeight > maxHeight) items.style.maxHeight = maxHeight + 'px'; // more than available - reset to available
        } else { // use max available
            items.style.maxHeight = maxHeight + 'px';
        }
        return control;
    };

    /**
     * @method _updateMenu Open or close menu to show or clear suggestions.
     * @param  {string|undefined} term Location search term when opening (for text highlighting). Omit to close menu and clear suggestions.
     * @return {object} The control object.
     * @private @ignore
     */
    control._updateMenu = (term = undefined) => {
        if(!control._element) return control; // destroyed

        // close if no input term, no suggestions to show, not visible, or not enabled
        control._element.control.classList.remove('gc-valid', 'gc-invalid'); // clear validation
        const nItems = control._suggestions.features.length;
        if(!term || !nItems || !control.visible() || !control.enable()) {
            if(term && !nItems) control._element.control.classList.add('gc-invalid'); // invalid when have term with no items to show
            control._suggestions.features = []; // clear suggestions
            control._element.menu.innerHTML = ''; // clear content
            control._element.menu.classList.remove('gc-open'); // close
            if(control._updateMenu.contentLength) control.trigger('onSuggest'); // trigger event if had content before
            control._updateMenu.contentLength = 0; // update for detecting content change later
            return control;
        }
        control._element.control.classList.add('gc-valid');

        // regex for highlighting term in item
        let regex;
        try { // regex on term with special regex characters can cause error
            // all space-separated parts of term occurring in item name are highlighted
            regex = new RegExp('(' + term.replace(/\*/gu, '').split(' ').join('|') + ')', 'gi'); // need remove all '*' wild cards
        } catch (err) {
            // no highlighting
            regex = new RegExp('()');
        }

        // build item html
        let itemsHtml = '';
        let currentType;
        control._suggestions.features.forEach((feature, index) => {
            // add type separator for new categories
            const p = feature.properties;
            if(p.Type !== currentType) {
                itemsHtml += /*html*/ `<div class="gc-menu-separator"> ${p.Type.toUpperCase()} </div>`;
                currentType = p.Type;
            }
            // add item
            itemsHtml += /*html*/
                `<div class="gc-menu-item ${nItems===1 ? 'gc-menu-item-active':''}" data-index="${index}">${
                    p.Name.replace(regex,   /*html*/ `<span style="color: var(--gc-text-match)">$1</span>`     ) + // line1: regex highlighted name
                    (p.County && p.State  ? /*html*/ `<div class="gc-muted">${p.County}, ${p.State}</div>` : '') + // line2: county, state
                    (p.Score!==100        ? /*html*/ `<div class="gc-muted">${p.Score}% match      </div>` : '')   // line3: score% when not 100
                }</div>`;
        });

        // set menu content, open, and position
        control._element.menu.innerHTML = /*html*/
            `<div class="gc-menu-title">
                ${nItems >= control.options.maxSuggestions ? 'Top ' : ''}${nItems} Suggestion${nItems>1 ? 's':''} <span style="float:right; cursor:pointer;">&#10006;</span>
             </div>
             <div class="gc-menu-items"> ${itemsHtml} </div>`;
        control._element.menu.classList.add('gc-open');
        control._positionMenu();

        // trigger event if content changed
        const contentLength = control._element.menu.innerHTML.length;
        if(contentLength !== control._updateMenu.contentLength) control.trigger('onSuggest');
        control._updateMenu.contentLength = contentLength;
        return control;
    };

    //.......................................
    // event listeners
    //.......................................

    // window
    // ...position menu when window resizes
    window.addEventListener('resize', control._positionMenu, {
        signal: control._eventAbortController.signal
    });
    // ...append menu to fullscreen element when map enters fullscreen mode, append back to body when exits
    window.addEventListener('fullscreenchange', () => (document.fullscreenElement || document.body).appendChild(control._element.menu), {
        signal: control._eventAbortController.signal
    });
    // ...close menu when a parent element other than the document scrolls (eg: control moves relative document shifting menu from control)
    window.addEventListener('scroll', evt => {
        if(evt.target !== document && evt.target.contains(control._element.control)) control._updateMenu();
    }, {
        signal: control._eventAbortController.signal,
        capture: true // include children
    });

    // control
    // ...locate when input changes
    control._element.input.addEventListener('input', gc.debounce(() => gc._locate(control), gc._config.debounceMs), {
        signal: control._eventAbortController.signal
    });
    // ...close menu when input looses focus
    control._element.input.addEventListener('blur', () => setTimeout(control._updateMenu, 200), { // need pause so can click menu items (100ms not enough)
        signal: control._eventAbortController.signal
    });
    // ...keyboard menu navigation
    control._element.input.addEventListener('keydown', evt => {
        const active = control._element.menu.querySelector('.gc-menu-item-active');
        switch (evt.which) {
        case 27: // ESC closes menu
            return control._updateMenu();
        case 13: // ENTER chooses active menu item and closes
            if(active) {
                active.click();
                control._updateMenu();
            }
            return;
        case 38: // ARROW UP   advances active menu item up
        case 40: // ARROW DOWN advances active menu item down
            const items = control._element.menu.querySelectorAll('.gc-menu-item');
            if(!items.length) return; // menu empty
            const iAdd = evt.which === 38 ? -1 : 1; //                                          add-subtract based on which key
            let i = active ? Number(active.dataset.index) : iAdd < 0 ? 0 : items.length - 1; // currently active
            i = (10 * items.length + i + iAdd) % items.length; //                               increment with wrap around
            items.forEach((item, index) => //                                                   set incremented active, rest inactive
                item.classList.toggle('gc-menu-item-active', index === i)
            );
            // leaflet plugin: set hover class and open marker tooltip
            if(control.suggestionLayer) {
                const markers = control.suggestionLayer.getLayers();
                const haveTooltip = markers[0].getTooltip; // tooltips unavailable for leaflet<1.0
                document.querySelectorAll('.gc-map-marker').forEach((item, index) => {
                    item.classList.toggle('gc-map-marker-hover', index === i);
                    if(haveTooltip) markers[index][index === i ? 'openTooltip' : 'closeTooltip']();
                });
            }
            // scroll menu to keep active item in view
            const menuItems = control._element.menu.querySelector('.gc-menu-items');
            if(items[i].offsetTop < menuItems.scrollTop) { // item out of view above
                menuItems.scrollTop = items[i].offsetTop; //  scroll menu so item at top
            }
            if(items[i].offsetHeight + items[i].offsetTop > menuItems.offsetHeight + menuItems.scrollTop) { // item out of view below
                menuItems.scrollTop = items[i].offsetHeight + items[i].offsetTop - menuItems.offsetHeight; //  scroll menu so item at bottom
            }
            return;
        }
    }, {
        signal: control._eventAbortController.signal
    });

    // menu
    // ...mouse enter-leave sets-unsets active item
    ['mouseenter', 'mouseleave'].forEach(evtType => control._element.menu.addEventListener(evtType, evt => {
        if(!evt.target.classList.contains('gc-menu-item')) return; // not a menu item
        control._element.menu.querySelectorAll('.gc-menu-item').forEach(item => item.classList.remove('gc-menu-item-active')); // set all items inactive
        evt.target.classList.toggle('gc-menu-item-active', evtType === 'mouseenter'); // set this item active on mouseenter, inactive otherwise
    }, {
        signal: control._eventAbortController.signal,
        capture: true // dispatch event for children (eg: dynamic menu-items created after this listener added)
    }));
    // ...clicking item selects location
    control._element.menu.addEventListener('click', evt => {
        evt.stopPropagation();
        const item = evt.target.closest('.gc-menu-item'); // get clicked item
        if(!item) return; // non-item clicked
        control._selected = control._suggestions.features[item.dataset.index]; // set selected
        control.value('').trigger('onSelect'); // clear input and trigger event
    }, {
        signal: control._eventAbortController.signal
    });
    return control;
};


/**
 * @method      _locate
 * @description Find location suggestions.
 * @param       {object} control The control object.
 * @return      {object} The control object.
 * @private @ignore
 */
gc._locate = control => {

    // parse input text
    const input = gc._locate.parseInput(control);

    // enough characters?
    if(control._element.input.value.trim().length < control.options.minCharacters) { // no
        return control._updateMenu(); // close menu
    }

    // in cache?
    if(input.cacheKey in control._cache) { // yes
        control._suggestions.features = control._cache[input.cacheKey]; // set features
        return control._updateMenu(input.term); // update menu content
    }

    // parsed as a lat-lon?
    if(input.latlon) { // yes
        const feature = gc._locate.getFeature(control, input, {
            Type: 'Latitude-Longitude Coordinate',
            Label: `Coordinate (${ input.latlon.join(', ') })`,
            Name: `Coordinate (${ input.latlon.join(', ') })`,
            Latitude: input.latlon[0],
            Longitude: input.latlon[1],
            Source: 'latlon'
        });
        if(feature) { // valid
            control._suggestions.features = [feature]; // set features
            return control._updateMenu(input.term); // update menu content
        }
    }

    //.......................................
    // start locate
    control._element.control.classList.add('gc-busy'); //        set busy state
    control._suggestions.features = []; //                       clear suggestions
    control._fetchAbortController.abort(); //                    abort any previous requests
    const fetchAbortController = control._fetchAbortController = new window.AbortController(); // reset abort controller
    const timeout = setTimeout(() => { //                        set timeout to abort this request
        console.warn(`[geocoder] SERVICE ERROR: Timeout expired (${gc._config.timeoutMs/1000} seconds).`);
        fetchAbortController.abort();
    }, gc._config.timeoutMs);

    // helper to end
    const endLocate = (cache = false) => {
        clearTimeout(timeout); //                                clear timeout
        control._element.control.classList.remove('gc-busy'); // clear busy state
        if(!fetchAbortController.signal.aborted) { //            when not aborted...
            if(cache) control._cache[input.cacheKey] = control._suggestions.features; // save to cache when specified
            control._updateMenu(input.term); //                  update menu
        }
    };

    // query api service
    const bounds = (control.options.bounds || []).flat();
    const searchParams = { // service options
        /* beautify ignore:start */
        term           : input.term,
        states         : input.states,
        latitudeMin    : bounds[0],
        longitudeMin   : bounds[1],
        latitudeMax    : bounds[2],
        longitudeMax   : bounds[3],
        include        : control.options.include.replace(/\s+/ug, ','), // allow space or comma delim
        maxSuggestions : control.options.maxSuggestions
        /* beautify ignore:end */
    };
    Object.keys(searchParams).forEach(key => { // remove undefined options (service error)
        if(searchParams[key] === undefined) delete searchParams[key];
    });
    fetch(gc._config.service1 + '?' + new window.URLSearchParams(searchParams).toString(), {
        signal: fetchAbortController.signal
    }).then(response => response.json()).then(json => {
        if(json.error) throw json.error; //                                   handled service error
        if(!Array.isArray(json)) throw 'Unexpected response (not array).'; // unhandled service error
        if(!json.length) throw 'NO_API_SUGGESTIONS'; //                       no suggestions found - throw error to query secondary service
        control._suggestions.features = json.map(properties => //             have suggestions - set features, filtering for valid
            gc._locate.getFeature(control, input, properties)
        ).filter(feature => feature);
        endLocate(true); // success, end and cache result

    }).catch(err1 => {
        if(fetchAbortController.signal.aborted || !control.options.include.toLowerCase().includes('gnis')) {
            endLocate(false); // aborted or gnis places not included, end without caching
            return; // exit catch
        } else if(err1 !== 'NO_API_SUGGESTIONS') {
            console.warn(`[geocoder] API SERVICE ERROR: "${err1.details || err1}" ...calling secondary service.`);
        }
        // query secondary service
        //   overview:  https://developers.arcgis.com/documentation/mapping-apis-and-services/search/services/geocoding-service/
        //   usage:     https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm
        //   meta data: https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer?f=pjson
        const [latMin, lonMin, latMax, lonMax] = (control.options.bounds || [-90, -180, 90, 180]).flat();
        fetch(gc._config.service2 + '?' +
            new window.URLSearchParams({
                // note: 'region' (state) option does not seem to work in combo with these
                f: 'json', //              required
                singleLine: input.term, // location to find
                sourceCountry: 'USA', //   limit candidates to specified country or countries
                searchExtent: [lonMin, latMin, lonMax, latMax].join(','), // limit candidates to a geographic extent
                category: // csv-list of place or address types to filter candidates, see table: https://developers.arcgis.com/rest/geocode/api-reference/geocoding-category-filtering.htm
                    'Address,Postal,Populated Place,' + // level1 (note: 'Coordinate System' can parse as lon-lat)
                    'Arts and Entertainment,Education,Land Features,Parks and Outdoors,Residence,Water Features,' + // level2
                    'Airport,Bus Station,Train Station', // level3
                maxLocations: control.options.maxSuggestions, // max number of candidates returned
                outFields: [ // see table: https://developers.arcgis.com/rest/geocode/api-reference/geocoding-service-output.htm
                    'Type', //       feature type                              => 'Type'          example: 'Waterfall' ("" when 'Addr_type' not 'POI' or 'Locality')
                    'Match_addr', // complete address                          => 'Name'          example: 'Boston, Massachusetts'
                    'ShortLabel', // shortened version of Match_addr           => 'Name'          example: 'Boston'
                    'Subregion', //  region subdivision name (county for USA)  => 'County'        example: 'Suffolk County'
                    'RegionAbbr', // region abbreviation (state for USA)       => 'State'         example: 'MA'
                    'Y', //          primary latitude,  WGS84 (WKID 4326)      => 'Latitude'      example:  42.35866000000004
                    'X', //          Primary longitude, WGS84 (WKID 4326)      => 'Longitude'     example: -71.05673999999993
                    'Ymin', //       minimum latitude  of the feature extent   => 'LatitudeMin',  example:  42.220660000000045
                    'Ymax', //       maximum latitude  of the feature extent   => 'LatitudeMax',  example:  42.49666000000004
                    'Xmin', //       minimum longitude of the feature extent   => 'LongitudeMin', example: -71.19473999999994
                    'Xmax', //       maximum longitude of the feature extent   => 'LongitudeMax', example: -70.91873999999993
                    'Score', //      score (1–100) indicating quality of match => 'Score'         example:  85.71
                    'Loc_name' //    name of the locator used                  => 'Source'        example: 'World'
                ].join(',')
            }).toString(), {
                signal: fetchAbortController.signal
            }
        ).then(response => response.json()).then(json => {

            // check
            if(!json.candidates) throw 'Invalid response (no candidate field).';
            if(!json.candidates.length) throw 'NO_SECONDARY_SUGGESTIONS';
            // get features
            const features = [];
            json.candidates.forEach(candidate => {
                const attr = candidate.attributes;
                if(attr.Type === 'Country') return; // for some reason search terms like 'aaaa' and 'bbbb' return countries - skip
                if(!attr.RegionAbbr) return; // require state, sometimes a different country returned when no state - skip
                const feature = gc._locate.getFeature(control, input, {
                    Type: attr.Type || 'Addresses and Other Suggestions', // street addresses have no type
                    Label: attr.Match_addr,
                    Name: attr.Type ? attr.ShortLabel : attr.Match_addr, // use Match_addr for street addresses
                    County: attr.Subregion,
                    State: attr.RegionAbbr,
                    Latitude: attr.Y,
                    Longitude: attr.X,
                    LatitudeMin: attr.Ymin,
                    LatitudeMax: attr.Ymax,
                    LongitudeMin: attr.Xmin,
                    LongitudeMax: attr.Xmax,
                    Score: attr.Score,
                    Source: 'esri-' + attr.Loc_name.toLowerCase()
                });
                if(!feature || // invalid
                    features.find(f => { // duplicate (same result can be returned from different sources)
                        const p1 = f.properties;
                        const p2 = feature.properties;
                        return p1.Type === p2.Type && p1.Name === p2.Name && p1.County === p2.County && p1.State === p2.State;
                    })
                ) return;
                features.push(feature);
            });
            // set suggestions and sort
            control._suggestions.features = features.sort((a, b) =>
                /* beautify ignore:start */
                a.properties.Type   > b.properties.Type   ? 1 : a.properties.Type  < b.properties.Type  ? -1 : // sort by type (to group in menu)
                a.properties.State  > b.properties.State  ? 1 : a.properties.State < b.properties.State ? -1 : // then state
                a.properties.County > b.properties.County ? 1 : -1                                             // then county
                /* beautify ignore:end */
            );
            // success, end and cache result (empty or not)
            endLocate(true);

        }).catch(err2 => {
            if(!fetchAbortController.signal.aborted && err2 !== 'NO_SECONDARY_SUGGESTIONS') console.warn(`[geocoder] SECONDARY SERVICE ERROR: ${err2}`); // actual error
            endLocate(false); // abort or error, end without caching
        });
    });
    return control;
};


/**
 * @private Helper to parse current input text using control options.
 * @param   {object} control The control object.
 * @return  {object} Object of parsed info for locate operation (see below).
 */
gc._locate.parseInput = control => {

    // object of info to parse
    const input = {
        term: undefined, //    search term
        states: undefined, //  upper-case csv search states or 'ALL'
        latlon: undefined, //  [decLat, decLon], undefined when none
        cacheKey: undefined // key for storing suggestions in cache
    };

    // parse term and get parts
    input.term = control._element.input.value.toUpperCase()
        .replace(/[^A-Z0-9\*\-\.]/g, ' ') // replace all except these with spaces: letters, numbers, '*' (wildcards), and '-','.' (latlon)
        .replace(/\s+/gu, ' ') //            replace multiple spaces with 1 space
        .replace(/^ST /u, 'SAINT ') //       'st ...' => 'saint ...' (less than 50 gnis places start with 'st ...')
        .trim();
    const parts = input.term.split(' ');

    // parse any 2-char state abbreviation at end
    input.states = (control.options.states || 'ALL').toUpperCase();
    const lower48 = 'AL AZ AR CA CO CT DE FL GA ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY';
    if(input.states === '48') input.states = lower48 + ' DC';
    if(input.states === '50') input.states = lower48 + ' AK HI DC';
    if(input.states === 'USGS') input.states = lower48 + ' AK HI DC GU PR VI';
    if(input.states === 'ALL') input.states = lower48 + ' AK HI DC GU PR VI AS FM MH MP PW UM';
    input.states = input.states.replace(/\s+/ug, ','); // allow space or comma delim
    const lastPart = parts.slice(-1)[0];
    if(parts.length > 1 && input.states.split(',').includes(lastPart)) { // last part matches an options.states - use it
        input.term = parts.slice(0, -1).join(' '); // term with without last part
        input.states = lastPart; // 2-char state
    } else if(control.options.states === undefined) {
        input.states = undefined; // reset undefined
    }

    // set cache key
    input.cacheKey = input.term + '|' + input.states;

    // parse supported lat-lon formats:
    //   8 part:      D M S [N|S]      D M S [E|W]   @example: 44° 57' 53.2728'' N,  93° 14' 27.4812'' W  =>  [ 44.964798, -93.240967]
    //   6 part: [+|-]D M S       [+|-]D M S         @example: 44  57  53            93  14  27           =>  [ 44.964722, -93.240833] (W assumed)
    //   4 part:      DD.DD [N|S]      DDD.D [E|W]   @example: 30.123456789 s        90.123456789 e       =>  [-30.123457,  90.123457] (rounded to 6 decimals)
    //   2 part: [+|-]DD.DD       [+|-]DDD.D         @example: 30.123456789          90.123456789         =>  [ 30.123457, -90.123457] (W assumed and rounded to 6 decimals)
    // notes:
    // * all formats in lat-lon order
    // * 'W' assumed when lon positive and 'E' not explicitly specified
    input.latlon = [NaN, NaN];
    const NS = {
        N: 1,
        S: -1
    };
    const EW = {
        E: 1,
        W: -1
    };
    const dms2dec = (d, m, s) => Math.sign(d) * (Number(d) + Number(m) / 60 + Number(s) / 3600);
    if(parts.length === 8) {
        input.latlon = [
            NS[parts[3]] * dms2dec(parts[0], parts[1], parts[2]),
            EW[parts[7]] * dms2dec(parts[4], parts[5], parts[6])
        ];
    } else if(parts.length === 6) {
        input.latlon = [
            dms2dec(parts[0], parts[1], parts[2]),
            -Math.abs(dms2dec(parts[3], parts[4], parts[5])) // always set negative (W)
        ];
    } else if(parts.length === 4) {
        input.latlon = [
            NS[parts[1]] * Number(parts[0]),
            EW[parts[3]] * Number(parts[2])
        ];
    } else if(parts.length === 2) {
        input.latlon = [
            Number(parts[0]),
            -Math.abs(Number(parts[1])) // always set negative (W)
        ];
    }
    if(isNaN(input.latlon[0]) || isNaN(input.latlon[1])) { // invalid
        input.latlon = undefined;
    } else { // round values for menu display
        input.latlon = input.latlon.map(x => Number(x.toFixed(gc._config.nCoordDecimals)));
    }
    return input;

};


/**
 * @private Helper to check properties and return a suggestion point feature.
 * @param   {object} control The control object.
 * @param   {object} input   Object of parsed info from the `parseInput` helper.
 * @param   {object} p       Object of feature properties.
 * @return  {object|undefined} Feature object when properties are valid, undefined when invalid.
 */
gc._locate.getFeature = (control, input, p) => {

    // check and set properties
    let isValid = true;
    const label = `${p.Name} (${ [p.County, p.State].filter(s => s).join(' ') })`.replace(' ( )', '');
    const dBounds = 10 ** -gc._config.nCoordDecimals;
    const roundCoord = x => Number(x.toFixed(gc._config.nCoordDecimals));
    const [latMin, lonMin, latMax, lonMax] = (control.options.bounds || [-90, -180, 90, 180]).flat();
    [
        /* beautify ignore:start */
        { name:'County'       , type:'string' , default: ''                    , /*no validation*/                                                   /*no formatting*/            },
        { name:'GnisId'       , type:'number' , default: null                  , /*no validation*/                                                   /*no formatting*/            },
        { name:'Label'        , type:'string' , default: label,                  /*no validation*/                                                   /*no formatting*/            },
        { name:'Latitude'     , type:'number' , /*required*/                     validate: lat => lat>=latMin && lat<=latMax                       , format: x => roundCoord(x)   },
        { name:'LatitudeMax'  , type:'number' , default: p.Latitude  + dBounds , /*no validation*/                                                   format: x => roundCoord(x)   },
        { name:'LatitudeMin'  , type:'number' , default: p.Latitude  - dBounds , /*no validation*/                                                   format: x => roundCoord(x)   },
        { name:'Longitude'    , type:'number' , /*required*/                     validate: lon => lon>=lonMin && lon<=lonMax                       , format: x => roundCoord(x)   },
        { name:'LongitudeMax' , type:'number' , default: p.Longitude + dBounds , /*no validation*/                                                   format: x => roundCoord(x)   },
        { name:'LongitudeMin' , type:'number' , default: p.Longitude - dBounds , /*no validation*/                                                   format: x => roundCoord(x)   },
        { name:'Name'         , type:'string' , /*required*/                     /*no validation*/                                                   /*no formatting*/            },
        { name:'Score'        , type:'number' , default: 100                   , validate: s => s >= gc._config.minScore                           , format: x => Math.round(x)   },
        { name:'Source'       , type:'string' , /*required*/                     /*no validation*/                                                   /*no formatting*/            },
        { name:'State'        , type:'string' , default: ''                    , validate: s => !input.states||input.states.split(',').includes(s) , format: x => x.toUpperCase() },
        { name:'Type'         , type:'string' , /*required*/                     /*no validation*/                                                   /*no formatting*/            }
        /* beautify ignore:end */
    ].forEach(o => {
        let value = p[o.name];
        value = o.type === 'string' ? (value || '').toString().trim() : o.type === 'number' ? parseFloat(value) : value;
        if(['', NaN].includes(value)) { // missing
            if(o.default !== undefined) {
                value = o.default;
            } else {
                console.warn(`[geocoder] API ERROR: Required property missing or invalid type: "${o.name}"`);
                isValid = false;
            }
        }
        if(o.validate && !o.validate(value)) isValid = false;
        p[o.name] = o.format ? o.format(value) : value;
    });

    // return feature when valid
    return !isValid ? undefined : {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [p.Longitude, p.Latitude]
        },
        properties: Object.assign(p, { // add bounds
            Bounds: [[p.LatitudeMin, p.LongitudeMin], [p.LatitudeMax, p.LongitudeMax]]
        })
    };

};


/**
 * @function    debounce
 * @description Prevent rapid, repeated executions. Waits to execute a function until a specified amount of time has elapsed without subsequent calls (single execution at end of queue).
 * @param       {function} fn       Function to debounce.
 * @param       {number}   [ms=250] Wait time, milliseconds.
 * @return      {function} Debounced function.
 * @example
 *   alert('Open console and click document rapidly several times to see click listener debounced.');
 *   window.addEventListener('click', gc.debounce(() => {
 *       console.warn('debounce: click listener executed once at end of queue (wait interval 0.5sec).');
 *   }, 500));
 */
gc.debounce = (fn, ms = 250) => {

    let timeout;
    return function (...args) {
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), ms);
    };

};


//===========================================
// leaflet plugin
//===========================================
/**
 * @extension   L.control.geocoder
 * @description Adds a geocoder control to a Leaflet map as an L.control.
 * @param       {Object} options Leaflet L.control options, extended plugin options, and `gc.create` options, see below.
 * @return      {L.Control} Leaflet control with extended plugin methods, see below.
 * @requires    Leaflet must be loaded before the Geocoder API for this plugin to be available. Tested with versions 0.7.0, 1.0.0, 1.7.1, and 1.8.0.
 * 
 * @example
 *   // add geocoder control when map created using 'geocoderControl' map option
 *   const map = L.map('MyMapId', {
 *       center: [40, -100],
 *       zoom: 4,
 *       layers: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
 *       // ...more map options...
 *       geocoderControl: {
 *           position: 'topleft',     // leaflet L.control option
 *           interaction: 'suggest',  // plugin option
 *           // ...more plugin options...
 *           placeholder: 'Example 1' // geocoder option
 *           // ...more geocoder options...
 *       }
 *   });
 * 
 *   // access after added using the map's 'geocoderControl' object
 *   map.geocoderControl.get().setOptions('size', 'lg');
 * 
 * @example
 *   // create geocoder L.control and add to existing map, assign to variable
 *   const myLeafletControl = L.control.geocoder({
 *       position: 'topright',    // leaflet L.control option
 *       interaction: 'select',   // plugin option
 *       // ...more plugin options...
 *       placeholder: 'Example 2' // geocoder option
 *       // ...more geocoder options...
 *   }).addTo(map);
 * 
 *   // access the L.control using the variable, use the 'get' plugin method to access the underlying geocoder object
 *   myLeafletControl.get().setOptions('size', 'lg');
 * 
 * @example
 *   // create geocoder L.control and add to existing map, specify 'id' plugin option
 *   L.control.geocoder({
 *       position: 'bottomleft',  // leaflet L.control option
 *       id: 'MyGeocoderId',      // plugin option
 *       // ...more plugin options...
 *       placeholder: 'Example 3' // geocoder option
 *       // ...more geocoder options...
 *   }).addTo(map);
 * 
 *   // use the api 'get' method to access the geocoder object by the id
 *   gc.get('MyGeocoderId').setOptions('size', 'lg');
 * 
 * @see [Leaflet   documentation]{@link https://leafletjs.com}
 * @see [L.Control documentation]{@link https://leafletjs.com/reference.html#control}
 * @see gc.create geocoder options
 */
if(window.L && L.Map) {
    // constructor
    L.Control.Geocoder = L.Control.extend({

        //.......................................
        // options
        //.......................................
        defaultOptions: {

            //.......................................
            // leaflet L.control options
            //.......................................

            /**
             * @property {string} position
             * @description
             *   Position on map, one of `topleft`, `topright`, `bottomleft`, `bottomright`.
             *   An `L.control` option, cannot be changed by the `setOptions` method.
             *   Use the control's `setPosition` method to change position after creation.
             * @see [L.Control setPosition]{@link https://leafletjs.com/reference.html#control-setposition}
             * @since 1.0.0
             */
            position: 'topright',

            //.......................................
            // extended plugin options
            //.......................................

            /**
             * @property {string} id
             * @description
             *   A unique id for accessing the geocoder control object using the `gc.get` method.
             *   Default is a randomly generated id.
             *   A plugin extension option, cannot be changed after creation.
             * @see L.control.geocoder for example usage.
             * @since 1.0.0
             */
            id: undefined,

            /**
             * @property {string} interaction
             * @description
             *   A built-in interaction mode, one of:
             *     - 'select'  Zoom map to chosen location and show popup when a menu suggestion is selected. Suggestions are not shown on the map.
             *     - 'suggest' Show menu suggestions on the map as `L.markers` as text is typed. Map is zoomed to a chosen location when a menu suggestion is selected or a marker is clicked.
             *     - 'none'    No action taken. Use the `onSelect` and/or `onSuggest` event callback options to define your own custom interactions.
             *   This option is ignored when the `onSelect` and/or `onSuggest` option(s) are specified.
             *   A plugin extension option, cannot be changed by the `setOptions` method.
             *   Once created, interactions can only be changed using the `setOptions` method to set the `onSelect` and/or `onSuggest` option(s).
             * 
             *   *NOTE* Interaction behavior may differ between leaflet versions because of feature availability.
             *   For example, the 'suggest' interaction includes marker tooltips for Leaflet version 1.x+ only.
             * @see onSelect option
             * @see onSuggest option
             * @since 1.0.0
             */
            interaction: 'select',

            //.......................................
            // gc.create options
            //.......................................

            /**
             * All `gc.create` options may be included and can be changed later using the `setOptions` method.
             * @see gc.create
             * @see gc.setOptions
             */
            size: 'sm' // matches leaflet 30px button height

        },

        //.......................................
        // extended plugin methods
        //.......................................

        /**
         * @method      get
         * @description An API extension method to access the geocoder object from the Leaflet control.
         * @return      {object} The geocoder object.
         * @since       1.0.0
         * @see         L.control.geocoder for example usage.
         */
        get: function () {
            return this._geocoderControl;
        },

        //.......................................
        /** @private setup */
        onAdd: function (map) {

            // create leaflet control container
            const leafletControl = this;
            const container = document.createElement('div');
            container.id = leafletControl.options.id || `Geocoder${Math.floor(1e6*Math.random())}`;
            document.body.append(container); // must be in document to create geocoder control

            // make copy of the leaflet control options to use for the geocoder control options
            const geocoderOptions = Object.assign({}, leafletControl.defaultOptions, leafletControl.options);

            // remove non-api options and create geocoder control
            const interaction = geocoderOptions.interaction; // save
            delete geocoderOptions.interaction;
            delete geocoderOptions.id;
            delete geocoderOptions.position;
            const geocoderControl = gc.create(container.id, geocoderOptions);
            geocoderControl._map = map;
            leafletControl._geocoderControl = geocoderControl;

            // disable mouse events in container and menu
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            L.DomEvent.disableClickPropagation(geocoderControl._element.menu);
            L.DomEvent.disableScrollPropagation(geocoderControl._element.menu);

            // interaction 'select' and 'suggest': zoom map and show popup when menu item selected
            if(['select', 'suggest'].includes(interaction) && !geocoderOptions.onSelect && !geocoderOptions.onSuggest) {
                geocoderControl.setOptions('onSelect', g => {
                    const p = g.getSelected().properties;
                    map.fitBounds(p.Bounds, {
                        maxZoom: 10
                    }).openPopup( /*html*/ `
                        <div style="min-width:150px; font-size:1rem;">
                            <div class="gc-muted"       >${ p.Type.toUpperCase() }</div>
                            <div style="font-size:120%;">${ p.Name               }</div>
                            <div class="gc-muted"       >${ p.County && p.State ? p.County+', '+p.State : '' }</div>
                            <div style="display:flex; justify-content:space-between; margin-top:3px;">
                                <a href="javascript: gc.get('${container.id}')._map.setView( [${p.Latitude},${p.Longitude}], gc.get('${container.id}')._map.getMaxZoom() ); void(0)"> Zoom </a>
                                <a href="javascript: gc.get('${container.id}')._map.closePopup(); void(0)"> Close </a>
                            </div>
                        </div>`, [p.Latitude, p.Longitude], {
                        maxWidth: 300,
                        closeButton: false
                    });
                });
            }

            // interaction 'suggest': show menu suggestions as markers on map
            if(['suggest'].includes(interaction) && !geocoderOptions.onSelect && !geocoderOptions.onSuggest) {
                // create layer
                geocoderControl.suggestionLayer = L.geoJson(null, {
                    pointToLayer: (feature, latlng) => {
                        const marker = L.marker(latlng, {
                            icon: L.divIcon({
                                className: 'gc-map-marker',
                                html: /*html*/ `<div>${gc._config.svg.magnifier}</div>`,
                                iconSize: [0, 0]
                            }),
                            zIndexOffset: 10000
                        }).on('click', () => {
                            geocoderControl._selected = feature;
                            geocoderControl.trigger('onSelect').value('');
                        });
                        if(marker.bindTooltip) marker.bindTooltip(() => { // tooltips unavailable for leaflet<1.0
                            const p = feature.properties;
                            return /*html*/ `
                            <div style="${p.Type.length>50||p.Name.length>50?'width:300px; white-space:normal;':''} font-size:1rem;">
                                <div class="gc-muted"       >${ p.Type.toUpperCase() }</div>
                                <div style="font-size:120%;">${ p.Name               }</div>
                                <div class="gc-muted"       >${ p.County && p.State ? p.County+', '+p.State : '' }</div>
                            </div>`;
                        }, {
                            direction: 'top',
                            offset: [0, -20]
                        });
                        return marker;
                    }
                });
                // callback
                geocoderControl.setOptions('onSuggest', g => {
                    // update layer
                    g.suggestionLayer.clearLayers().addData(g.getSuggestions()).addTo(map);
                    const bounds = g.suggestionLayer.getBounds();
                    if(!bounds.isValid()) return map.removeLayer(g.suggestionLayer); // no suggestions, done (note: no layer.remove() for leaflet<1.0)
                    // zoom to suggestions, pad to account for menu width and map controls
                    const menuWidth = g._element.menu.offsetWidth;
                    map.closePopup().fitBounds(bounds, {
                        paddingTopLeft: [leafletControl.getPosition().includes('left') ? menuWidth : 30, 60], // [left, top]
                        paddingBottomRight: [leafletControl.getPosition().includes('right') ? menuWidth : 30, 30], // [right, bottom]
                        maxZoom: 8
                    });
                });
                // suggestion menu mouse events
                ['mouseenter', 'mouseleave'].forEach(evtType => geocoderControl._element.menu.addEventListener(evtType, evt => {
                    if(!evt.target.classList.contains('gc-menu-item')) return;
                    const markers = document.querySelectorAll('.gc-map-marker');
                    markers.forEach(item => item.classList.remove('gc-map-marker-hover')); // remove hover classes for all markers
                    if(evtType === 'mouseenter') { // enter menu item: open tooltip and add hover class for this marker
                        const index = evt.target.dataset.index;
                        const marker = geocoderControl.suggestionLayer.getLayers()[index];
                        if(marker.openTooltip) marker.openTooltip(); // tooltips unavailable for leaflet<1.0
                        markers[index].classList.add('gc-map-marker-hover');
                    } else { // exit menu item: close tooltip for all markers
                        geocoderControl.suggestionLayer.invoke('closeTooltip');
                    }
                }, {
                    signal: geocoderControl._eventAbortController.signal,
                    capture: true // dispatch event for children (eg: dynamic menu-items created after this listener added)
                }));
            }
            return container;
        },

        onRemove: function () {
            // cleanup
            this._geocoderControl.destroy();
        }

    });

    // factory
    L.control.geocoder = options => new L.Control.Geocoder(options);

    // map option
    L.Map.addInitHook(function () {
        const map = this;
        if(map.options.geocoderControl) map.geocoderControl = L.control.geocoder(map.options.geocoderControl).addTo(map);
    });

}
