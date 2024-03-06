var lang = 'is';
//TODO: Copied from anniversaries.js, get from a common source
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
  },
  is : {
    monthArr : ['','janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'],
    monthShort : ['','jan.','feb.','mars','apr.','maí','júní','júlí','ágú.','sept.','okt.','nóv.','des.'],
    fullDate : function ( day,monthStr ) {
      return ( day + '. ' + monthStr );
    },
  },
};

i18n = i18n[lang] || i18n.en;

function generateTree(obj, parentLevel, parentId) {
  console.log('generating tree');
  // --------v create an <ul> element
  const ul = document.createElement ('ul');
  let id = 't';
  // --v loop through its children
  for (let f = 0; f < obj.tree.length; f++) {
    const person = obj.tree[f];
    const isParent = person.tree != null;
    const li = document.createElement ('li');
    let level = 0;
    if (parentId) {
      id = parentId + '-' + f;
      level = parentId.split('-').length;
    }


    if (isParent) {
      makeParent(li, id, f);
    }
    if (person.link === 'spouse') {
      li.classList.add('spouse');
      //To make spouse the same level as the 'parent'
      level--;
    }
    li.classList.add('level' + level);
    addLabel(li, person.name, person.born, person.died, person.addr, person.link === 'spouse', person.wed, id);
    addBgColorClass(li, id, parentId, person.link === 'spouse');
    // if the child has a 'tree' property on its own, call me again
    if (isParent) {
      li.appendChild(generateTree(person, parentLevel, id));
    }
    ul.appendChild (li);
  }
  return ul;
}

function makeParent(parentNode, id) {
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.setAttribute('name', id);
  input.setAttribute('id', id);
  parentNode.appendChild(input);
}

function addLabel(parentNode, name, birthday, died, address, isSpouse, wed, id) {
  const nameLabel = document.createElement('label');
  const textNode = document.createTextNode(name + ' ');
  nameLabel.setAttribute('for', id);
  nameLabel.appendChild(textNode);

  addAgedSpan(nameLabel, birthday, died);
  addMetaSpan(nameLabel, birthday, died, address, isSpouse, wed);

  parentNode.appendChild(nameLabel);
}

/*
 Add to parent node something like: <span class="now"> ✞ </span> or <span class="now"> (72)</span>
 */
function addAgedSpan(parentNode, birthday, died) {
  const agedSpan = document.createElement('span');
  agedSpan.classList.add('now');

  const age = getAge(birthday);
  let agedString = '';
  if (died) {
    agedString = ' ' + String.fromCharCode(10014) + ' ';
  } else {
    agedString = ' (' + age + ')';
  }

  const textNode = document.createTextNode(agedString);
  agedSpan.appendChild(textNode);
  parentNode.appendChild(agedSpan);
}

/*
   Add to parent node something like: <span class="meta">10. jan. 1919 - 18. maí 2006</span>

    or add metadata about birthday and current address
 */
function addMetaSpan(parentNode, birthday, died, address, isSpouse, wed) {
  const metaSpan = document.createElement('span');
  metaSpan.classList.add('meta');

  let metaString = '';
  if (died) {
    metaString += getDateStr(birthday, true) + ' - ' + getDateStr(died, true);
  } else {
    addDetailSpan(metaSpan, birthday, address)
  }

  const textNode = document.createTextNode(metaString);
  metaSpan.appendChild(textNode);

  if (isSpouse && wed) { // check here, since addDetailSpan does not apply to dead persons
    const wedSpan = document.createElement('span');
    wedSpan.classList.add('wed');

    const wedString = getDateStr(wed, true);
    const wedTextNode = document.createTextNode(wedString);

    wedSpan.appendChild(wedTextNode);
    metaSpan.appendChild(wedSpan);
  }

  parentNode.appendChild(metaSpan);
}

function addDetailSpan(parentNode, birthday, address) {
  const birthSpan = document.createElement('span');
  const addressSpan = document.createElement('span');

  birthSpan.classList.add('birth');
  addressSpan.classList.add('address');

  const birthString = getDateStr(birthday, true);

  const birthTextNode = document.createTextNode(birthString);
  const addressTextNode = document.createTextNode(address);

  birthSpan.appendChild(birthTextNode);
  addressSpan.appendChild(addressTextNode);

  parentNode.appendChild(birthSpan);
  parentNode.appendChild(addressSpan);
}



//A bit of duplication of code for now since personsLogic returns an array I don't need
function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getDateStr (yyyymmdd, shortMonth) {
  // input: 'yyyy-mm-dd' (as a string)
  // option: shortMonth (boolean) => 'apr.'/'apríl'
  // returns a string: 'dd. monthname yyyy' / '11. apríl 1980' / '1. apríl 1980' / '1. apr. 1980'
  var y = yyyymmdd.substring( 0,4 ) * 1; // num
  var d = yyyymmdd.substring( yyyymmdd.length - 2 ) * 1; // num
  var m = yyyymmdd.substring( 5,7 ) * 1; // num
  var monthStr = shortMonth ? i18n.monthShort[m] : i18n.monthArr[m];
  return ( i18n.fullDate( d,monthStr ) + ' ' + y );
}

/**
 * Add css class to parentNode.
 * The class is generated from the id, unless the person is a spouse, then the class is generated from the parentId
 */
function addBgColorClass(parentNode, id, parentId, isSpouse) {
  var createFromId = id;
  if (isSpouse && parentId) {
    createFromId = parentId;
  }
  if (createFromId) {
    var cssClass = createFromId;
    var idSplit = createFromId.split('-');
    var generation = idSplit.length - 2;
    if (generation > 0) {
      var suffix = '';
      if (idSplit[2] != '0') {
        suffix = 'x' + generation;
      }
      cssClass = idSplit[0] + '-' + idSplit[1] + suffix;
    }
    parentNode.classList.add(cssClass);
  }
}

/**
 * Expand tree at a specific person. Example: http://localhost:3000/#t-3-1
 * @param personId
 */

function jumpTo(personId) {
  // Go from given id up to root of  family tree, expanding every parent
  while (personId) {
    findAndExpand(personId);
    if (personId.lastIndexOf('-') > -1) {
      personId = personId.substr(0, personId.lastIndexOf('-'));
    } else {
      personId = null;
    }
  }
}

function findAndExpand(personId) {
  var personElement = document.getElementById(personId);
  if (personElement) {
    personElement.checked = true;
  }
}

function makeTree(parentNode) {
  var data = window.personsTree;
  const tree = generateTree(data, 0);
  parentNode.appendChild(tree);
}


