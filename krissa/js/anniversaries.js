var lang = 'is';
var _ = window._;
var i18n = {
        en : {
            monthArr : ['','January','February','March','April','May','June','July','August','September','October','November','December'],
            monthShort : ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            fullDate : function ( day,monthStr ) {
                var suffix = 'th';
                suffix = ( _.indexOf([1,21,31],day) > -1 ? 'st' : suffix );
                suffix = ( _.indexOf([2,22],day) > -1 ? 'nd' : suffix );
                suffix = ( _.indexOf([3,23],day) > -1 ? 'rd' : suffix );
                return ( monthStr + ' ' + day + suffix );
            },
            getYears : function ( age ) {
                return ( age === 1 ? (age + ' year') : (age + ' years') );
            },
            person : _.template('<%= name %>, <%= years %> old'),
            str : {
                upcomingBirthdays : 'Upcoming birthdays',
                upcomingMajors : 'Major events',
            },
        },
        is : {
            monthArr : ['','janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'],
            monthShort : ['','jan.','feb.','mars','apr.','maí','júní','júlí','ágú.','sept.','okt.','nóv.','des.'],
            fullDate : function ( day,monthStr ) {
                return ( day + '. ' + monthStr );
            },
            getYears : function ( age ) {
                return ( ( age % 10 ) === 1 ? (age + ' árs') : (age + ' ára') );
            },
            person : _.template('<%= name %> (<%= years %>)'),
            died : _.template('<%= age %> ár síðan <%= name %> lést'),
            born : _.template('<%= age %> ár síðan <%= name %> fæddist'),
            marriage : _.template('<%= name %> eiga <%= years %> brúðkaupsafmæli'),
            marriagePast : _.template('<%= name %> ættu <%= years %> brúðkaupsafmæli'),
            newborn : _.template('<%= name %> fæddist <%= date %> (<%= parents %>)'),
            str : {
                upcomingBirthdays : 'Afmæli',
                upcomingMajors : 'Stórviðburðir',
                ageGroups : 'Aldursskipting',
                byMonths : 'Afmælismánuðir',
                residence : 'Búseta',
                recentAdditions : 'Nýjustu (skráðu) viðbætur',
            },
        },
    };

i18n = i18n[lang] || i18n.en;

var _getDateStr = function (mmdd, shortMonth) {
        // input: 'mmdd' or 'mm-dd' (as a string)
        // option: shortMonth (boolean) => 'apr.'/'apríl'
        // returns a string: 'dd. monthname' / '11. apríl' / '1. apríl' / '1. apr.'
        var d = mmdd.substring( mmdd.length - 2 ) * 1; // num
        var m = mmdd.substring( 0,2 ) * 1; // num
        var monthStr = shortMonth ? i18n.monthShort[m] : i18n.monthArr[m];
        return ( i18n.fullDate( d,monthStr ) );
};


// Upcoming birthdays (persons only)
var upcomingBdays = Aunt.findNextAnniversaries( 8,'person' );
var tb = document.querySelector('#birthdays tbody');
document.querySelector('#birthdays th').innerHTML = '<span>'+ i18n.str.upcomingBirthdays +'</span>';

_.forEach(upcomingBdays, function (item) {
    tb.innerHTML += '<tr>' +
        '<td>' + _getDateStr(item.mmdd,true) + '</td>' +
        '<td>' + i18n[item.itemType]({
                    name: item.itemName,
                    age:  item.yearsThen,
                    years: i18n.getYears(item.yearsThen),
                }) + '</td>' +
        '</tr>';
});

// TODO: Create a common pattern for writing these tables

// Upcoming major events (all anniversaries, multiples of 5)
var upcomingMajors = Aunt.findNextAnniversaries( 6,'all',5 );
tb = document.querySelector('#majors tbody');
document.querySelector('#majors th').innerHTML = '<span>'+ i18n.str.upcomingMajors +'</span>';

_.forEach(upcomingMajors, function (item) {
    tb.innerHTML += '<tr>' +
        '<td>' + _getDateStr(item.mmdd,true) + '</td>' +
        '<td>' + i18n[item.itemType]({
                    name: item.itemName,
                    age:  item.yearsThen,
                    years: i18n.getYears(item.yearsThen),
                }) + '</td>' +
        '</tr>';
});

var familyTreeHeader = document.querySelector('#treeheading');
familyTreeHeader.append(' ('+window.personsArray.length+' pers.)');

// Latest additions (child and parent(s))
var youngestFirst = _.orderBy(window.personsArray, 'born', 'desc');
tb = document.querySelector('#recentadditions tbody');
document.querySelector('#recentadditions th').innerHTML = '<span>'+ i18n.str.recentAdditions +'</span>';

var count = 3;
var i = 0;
_.forEach(youngestFirst, function (child) {
  var bDay = _getDateStr(child.mmdd,true) + ' ' + child.born.substring(0,4);
  var parent = window.personsArray[child.treeOf];
  var parentSpouse = parent.tree[0].link === 'spouse' ? parent.tree[0].name : false;
  var parentsString = parent.name + ( parentSpouse ? ' & ' + parentSpouse : '');

  tb.innerHTML += '<tr>' +
        '<td>' + i18n.newborn({
            'date' : bDay,
            'name' : child.name,
            'parents' : parentsString,
        }) + '</td>' +
        '</tr>';
  i++;
  if (i === count ) {
    return false;
  }
});

////////////////// Demographic functions /////////////
var _graphBars = function (num) {
  // input: number
  // returns a string of icons (4 -> '||||')
  var output = '';
  var i = 0;
  while (i < num) {
    output += '|';
    i++;
  }
  return output;
};

// Age splits
var ageGroupObj = _.groupBy(
        window.personsArray, function (obj) {
            if (!obj.died) {
                return (Math.floor( obj.yearsNow/5 ));
            } else {
                return 'deceased';
            }
        });
tb = document.querySelector('#agegroups tbody');
document.querySelector('#agegroups th').innerHTML = '<span>'+ i18n.str.ageGroups +'</span>';

_.forInRight(ageGroupObj, function (value,key) {
    if ( key !== 'deceased' ) {
        key = key * 1; // number
        tb.innerHTML += '<tr>' +
            '<td>' + (key * 5) + ' - ' + ((key+1) * 5) + '</td>' +
            '<td><span title="' + value.length + '">' + _graphBars(value.length) + '</span></td>' +
            '</tr>';
    }
});

// Birthdays by months
var bdaysByMonth = _.groupBy(
    window.personsArray, function (obj) {
        return (obj.mmdd.substring( 0,2 ) * 1);
    });
tb = document.querySelector('#bymonths tbody');
document.querySelector('#bymonths th').innerHTML = '<span>'+ i18n.str.byMonths +'</span>';

_.forIn(bdaysByMonth, function (value,key) {
    tb.innerHTML += '<tr>' +
    '<td>' + i18n.monthArr[key] + '</td>' +
    '<td><span title="' + value.length + '">' + _graphBars(value.length) + '</span></td>' +
    '</tr>';
});

// Residence
var residence = _.groupBy(
    window.personsArray, function (obj) {
        if (!obj.died) {
            return obj.addr;
        } else {
            return 'deceased';
        }
    });
    tb = document.querySelector('#residence tbody');
    document.querySelector('#residence th').innerHTML = '<span>'+ i18n.str.residence +'</span>';
    // Aunt.logArray (residence);
    // TODO: Sort addr by alphabetical order

    _.forIn(residence, function (value,key) {
        if (key !== 'deceased') {
            tb.innerHTML += '<tr>' +
            '<td>' + key + '</td>' +
            '<td><span title="' + value.length + '">' + _graphBars(value.length) + '</span></td>' +
            '</tr>';
        }
});

