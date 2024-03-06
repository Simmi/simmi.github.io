// TODO: Convert to a 'public domain' family tree for testing, e.g. the British royals

var personsTree = [
    { // family root
        name: 'Sigrún Ingibjörg Sigurþórsdóttir',
        born: '1919-01-10',
        died: '2006-05-18',
        addr: '(Reykjavík)',
        tree: [
            {
                name: 'Þórarinn Þórarinsson',
                link: 'spouse',
                 wed: '1940-09-06',
                born: '1904-06-06',
                died: '1985-08-02',
                addr: '(Reykjavík)',
            },
            {
                name: 'Stefán Þórarinsson',
                link: 'child',
                born: '1947-03-26',
                addr: 'Egilsstöðum',
                tree: [
                    {
                        name: 'Helga Jóna Þorkelsdóttir',
                        link: 'spouse',
                         wed: '1972-07-24',
                        born: '1947-05-30',
                        addr: 'Egilsstöðum',
                    },
                    {
                        name: 'Þórarinn Stefánsson',
                        link: 'child',
                        born: '1973-04-02',
                        addr: 'Reykjavík',
                        tree: [
                            {
                                name: 'Alexandra Þórlindsdóttir',
                                link: 'spouse',
                                 wed: '2015-10-02',
                                born: '1975-10-14',
                                addr: 'Reykjavík',
                            },
                            {
                                name: 'Patrekur Þórarinsson',
                                link: 'child',
                                born: '2012-02-14',
                                addr: 'Reykjavík',
                            },
                        ],
                    }, // end Þórarinn
                    {
                        name: 'Erlendur Stefánsson',
                        link: 'child',
                        born: '1975-12-31',
                        addr: 'Hafnarfirði',
                        // Halldóra 1976-06-18
                        // Vilborg 2003-11-14
                        // Vigdís Helga 2009-06-21
                    },  // end Erlendur
                    {
                        name: 'Sigmar Stefánsson',
                        link: 'child',
                        born: '1980-03-02',
                        addr: 'Reykjavík',
                        tree: [
                            {
                                name: 'Kristjana Guðjónsdóttir',
                                link: 'spouse',
                                 wed: false,
                                born: '1982-09-18',
                                addr: 'Reykjavík',
                            },
                            {
                                name: 'Magnea Guðný Kristjönudóttir Sigmarsdóttir',
                                link: 'child',
                                born: '2015-02-14',
                                addr: 'Reykjavík',
                            },
                        ],
                    },  // end Sigmar
                    {
                        name: 'Margrét Stefánsdóttir',
                        link: 'child',
                        born: '1983-01-12',
                        addr: 'Reykjavík',
                        tree: [
                            {
                                name: 'Ari Guðfinnsson',
                                link: 'spouse',
                                 wed: '2014-06-21',
                                born: '1978-12-18',
                                addr: 'Reykjavík',
                            },
                            {
                                name: 'Stefán Arason',
                                link: 'child',
                                born: '2011-01-21',
                                addr: 'Reykjavík',
                            },
                            {
                                name: 'Finnur Arason',
                                link: 'child',
                                born: '2012-12-12',
                                addr: 'Reykjavík',
                            },
                        ],
                    },  // end Margrét
                ],
            },  // end Stefán
            {
                name: 'Halldór Þórarinsson',
                link: 'child',
                born: '1962-11-25',
                addr: 'Reykjavík',
            },
        ],
    },
    { // new root
        name: 'Johnny Doe',
        born: '1919-09-09',
        addr: 'US',
    },
];