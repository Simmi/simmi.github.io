/*eslint no-console: 0 */

var personsTree;
var cfg;
var _;
var personsArray;
var anniversArray;
var mArray;

var Aunt = {

    init : function () {
        personsTree = window.personsTree;
        cfg         = window.config;
        _           = window._; // lodash
        personsArray  = []; // reset for testing
        anniversArray = []; // reset for testing
        mArray        = []; // reset for testing
        Aunt._setCurrentDate();
        Aunt.processTree ( personsTree.tree );
    },

    // Helper functions ********************************************

    logArray : function ( arr, label ) {
        if (label) {
            console.log( '=== ' + label + ' ===' );
        }
        console.table(arr); // use the built-in .table()
    },

    _getDateObject : function ( isoString ) {
        // input: a ISO-formated string, containing at least 'yyyy-mm-dd'
        // returns an object: {day:'mmdd', year:'yyyy'}
        // if no isoString is provided, returns object for current date

        var regex = /(\d{4})-(\d{2})-(\d{2})/;
        var dayString = isoString ? isoString : (new Date()).toJSON();
        // full ISO-date, e.g. "2015-07-14T22:29:34.304Z"
        var matchArr = dayString.match(regex);
        var yyyy = matchArr[1];
        var mmdd = matchArr[2]+matchArr[3];
        return ( {'year': yyyy , 'day': mmdd } ); // returns strings
    },

    // see also _getDateStr() in anniversaries.js

    _setCurrentDate : function () {
        var today = Aunt._getDateObject();
        // these might have been manually set for testing
        cfg.currentYear = ( cfg.currentYear || today.year ); // string
        cfg.currentDay  = ( cfg.currentDay  || today.day ); // string
        return;
    },

    // Tree and person functions ********************************************

    processTree : function ( tree, fromPersonId ) {
        // fromPersonId sets the person (node) to start iterating from
        if (_.isArray(tree)) {
            tree.forEach(function (el) {
                if (_.isObject(el)) {
                    Aunt.handlePerson(el, fromPersonId );
                }
            });
        }
    },

    addAnniversary : function ( dateString, itemType, itemId, itemName, objectItself ) {
        // pushes person or marriage as an object to the anniversary array
        //     eg: { mmdd: '1231', yearsNow: 44, itemType: 'person', (etc) }
        // returns array (which seems a bit wierd two years later...)
        var anniObj = {};
        var yearsNow;
        var dateObj = Aunt._getDateObject( dateString ); // birthdate / wedding day / etc.
        var ageAtYearEnd = ( _.parseInt(cfg.currentYear) - _.parseInt(dateObj.year) );
        var mmdd = dateObj.day;

        if ( _.parseInt(cfg.currentDay) < _.parseInt(mmdd) ) {
            // birthday yet to come
            yearsNow = ageAtYearEnd-1;
        } else {
            yearsNow = ageAtYearEnd;
        }

        anniObj.mmdd     = mmdd;
        anniObj.yearsNow = yearsNow;
        anniObj.itemId   = itemId;
        anniObj.itemType = itemType;
        anniObj.itemName = itemName;

        anniversArray.push(anniObj);

        if (objectItself) {
            objectItself.mmdd = mmdd;
            objectItself.yearsNow = yearsNow;
            return ( objectItself );
        }
    },

    //Small test by Sigmar, can probably be removed soon
    getAnniversary : function ( dateString, objectItself ) {

        console.log('1 ' + dateString);
        var yearsNow;
        var dateObj = Aunt._getDateObject( dateString ); // birthdate / wedding day / etc.
        var ageAtYearEnd = ( _.parseInt(cfg.currentYear) - _.parseInt(dateObj.year) );
        var mmdd = dateObj.day;

        if ( _.parseInt(cfg.currentDay) < _.parseInt(mmdd) ) {
            // birthday yet to come
            yearsNow = ageAtYearEnd-1;
        } else {
            yearsNow = ageAtYearEnd;
        }

        if (objectItself) {
            objectItself.mmdd = mmdd;
            objectItself.yearsNow = yearsNow;
            return ( objectItself );
        }
    },

    setPersonAge : function ( person ) {
        var alive = !person.died;
        // adding specific types of anniversary for the deceased ('born' + 'died')
        person = Aunt.addAnniversary( person.born, ( alive ? 'person' : 'born' ) , person.personId, person.name, person );
        if (!alive) {
            Aunt.addAnniversary( person.died, 'died' , person.personId, person.name );
        }
    },

    resolveMarriage : function ( person ) {
        if ( person.wed ) {
            var obj = {};
            mArray.push(obj);
            obj.id = mArray.length - 1;
            obj.node = personsArray[person.treeOf].name;
            obj.marriedTo = person.name;
            obj.wed = person.wed;
            var marriageState = ( person.died || personsArray[person.treeOf].died ) ? 'marriagePast' : 'marriage';
            obj = Aunt.addAnniversary( obj.wed, marriageState, obj.id, obj.node + ' & ' + obj.marriedTo, obj );
        }
    },

    handlePerson : function ( obj, fromPersonId ) {
        var treeOf = _.isNumber(fromPersonId) ? fromPersonId : 'root' ;
        if ( _.has(obj, 'name') ) {
            obj.treeOf = treeOf;

            personsArray.push( obj );
            obj.personId = personsArray.length - 1;

            Aunt.setPersonAge( obj );

            Aunt.resolveMarriage( obj );
            if ( _.has(obj,'tree') ) {
                Aunt.processTree( obj.tree, obj.personId );
            }
        }
    },

    findNextAnniversaries : function ( count, itemType, multipleOf ) {
        var num =   ( count || 5 );
        var iType = ( itemType || 'all' );
        var divBy = ( multipleOf || 1 );
        var toDayNum = _.parseInt(cfg.currentDay);

        var source = _.clone(anniversArray); // TODO: this does not clone the anniversary objects themselves

        var upcoming = _(source)
                        .filter( function (o) {
                            return (iType === 'all' || o.itemType === iType);
                        })
                        .map( function (o) {
                            // change yearsNow into age on anniversary
                            o.yearsThen = (_.parseInt(o.mmdd) === toDayNum) ? o.yearsNow : o.yearsNow + 1;
                            // if anniversary is today, yearsThen is the same as yearsNow
                            return o;
                        })
                        .filter( function (o) {
                            // match the age multipleOf
                            return (o.yearsThen % divBy === 0 && o.yearsThen >= divBy);
                        })
                        .sortBy(
                            function (o) { return (_.parseInt(o.mmdd) < toDayNum); }, // day not passed
                            'mmdd',
                            'yearsNow')
                        .value();

        var results = [];
        var lastDateSeen = '';

        _(upcoming)
            .forEach( function (o,i) {
                if (i < num) {
                    lastDateSeen = o.mmdd;
                    results.push(o);
                } else if (o.mmdd === lastDateSeen) {
                    // shares anniversary with the last match
                    results.push(o);
                }
            });
        // Aunt.logArray(results, 'Results');
        return results;
    },

    // Rendering functions ********************************************

// TODO: Render some stuff to browser
    // renderNextBirthdays : function ( count, itemType, multipleOf) {

    // },

};

