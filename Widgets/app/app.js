var widgets = [
    {
        name: 'W1',
        number: '99',
        pairs: [
            { key: 'first', value: 'f1', k: false, v: false },
            { key: 'last', value: 'l1', k: false, v: false },
            { key: 'nik', value: 'n1', k: false, v: false }]
    },
    {
        name: 'W2',
        number: '60',
        pairs: [
            { key: 'first', value: 'f2', k: false, v: false },
            { key: 'last', value: 'l2', k: false, v: false },
            { key: 'nik', value: 'n2', k: false, v: false }]
    },
    {
        name: 'W3',
        number: '70',
        pairs: [
            { key: 'first', value: 'f3', k: false, v: false },
            { key: 'last', value: 'l3', k: false, v: false },
            { key: 'nik', value: 'n3', k: false, v: false }]
    }
];

var tempWidget = [];

angular
    .module('routerApp', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/{number}',
                views: {
                    '': { templateUrl: 'partial-home.html' },
                    // the child views will be defined here (absolutely named)
                    'columnOne@home': {
                        templateUrl: 'Sammery.html',
                        controller: 'sammeryController'
                    },

                    // for column two, we'll define a separate controller 
                    'columnTwo@home': {
                        url: ':number',
                        templateUrl: 'Details.html',
                        controller: 'detailsController'
                    }
                }

            })

            .state('edit', {
                url: '/edit/{number}',
                templateUrl: 'edit.html',
                controller: 'editController'
            });
    })

    .controller('sammeryController', function ($scope, $rootScope) {
        $scope.widgets = widgets;

        $scope.getDetails = function (number) {
            $rootScope.$emit('getDetails', number);
        }

        $scope.removeWidget = function (number) {
            var index = widgets.findIndex(element => element.number == number);
            widgets.splice(index, 1);
            $rootScope.$emit('close');
        }

        $scope.editDetails = function () {
            sessionStorage.setItem('number', 0);
        }
    })

    .controller('detailsController', function ($scope, $rootScope, $state) {
        $rootScope.$on('getDetails', function (event, nunber) {
            var t = widgets.filter(obj => { return obj.number == nunber })[0];
            $scope.name = t.name;
            $scope.number = t.number;
            $scope.word_number = number2Words(t.number);
            $scope.pairs = t.pairs;
            $scope.show(true);
            $state.go('.', { number: $scope.number }, { location: true, inherit: true, relative: $state.$current, notify: false });
        });

        $rootScope.$on('close', function (event) {
            $scope.show(false);
        });

        $scope.show = function (val) {
            $scope.showDetails = val;
        }

        $scope.editDetails = function (number) {
            sessionStorage.setItem('number', number);
        }
    })

    .controller('editController', function ($scope, $state) {
        tempWidget = concatArrars([], widgets);
        $scope.disabled = true;

        var t = widgets.filter(obj => { return obj.number == sessionStorage.getItem('number') })[0];
        if (t) {
            $scope.name = t.name;
            $scope.number = parseInt(t.number);
            if (t.pairs.length >= 5)
                $scope.pairs = t.pairs;
            else {
                fixArray = new Array(5 - t.pairs.length).fill({ key: "", value: "", k: false, v: false });
                $scope.pairs = concatArrars(t.pairs, fixArray);
            }
            $state.go('.', { number: $scope.number }, { location: true, inherit: true, relative: $state.$current, notify: false });
        } else {
            $scope.name = '';
            $scope.number = '';
            $scope.pairs = new Array(5).fill({ key: "", value: "", k: false, v: false });
            $scope.pairs = concatArrars([], $scope.pairs);
            $scope.new_one = true;
        }

        $scope.removePair = function (widget, index) {
            widget.pairs.splice(index, 1);
            var fix5 = new Array(5 - widget.pairs.length).fill({ key: "", value: "", k: false, v: false });
            $scope.pairs = concatArrars(widget.pairs, fix5);
        }

        $scope.addPair = function (widget, index) {
            var pair = { key: '', value: '', k: false, v: false };
            var firstPart = concatArrars(widget.pairs.slice(0, index + 1), pair);
            var lastPart = widget.pairs.slice(index + 1, widget.pairs.length);
            $scope.pairs = concatArrars(firstPart, lastPart);
        }

        $scope.save = function (widget, new_one = false) {
            if (valid(widget)) {
                for (i = widget.pairs.length - 1; i >= 0; i--) {
                    pair = widget.pairs[i];
                    if (pair.key == "" && pair.value == "") {
                        widget.pairs.splice(i, 1);
                    }
                }
                var t = widgets.findIndex(widg => widg.number == widget.number)
                if (t < 0 && new_one) {
                    widgets.push({ name: widget.name, number: widget.number, pairs: $scope.pairs });
                }
                else if (t >= 0 & !new_one) {
                    widgets[t] = { name: widget.name, number: widget.number, pairs: $scope.pairs };
                    widgets = concatArrars([], widgets);
                }
                tempWidget = [];
                $state.go('home');
            }
        }

        $scope.cancel = function () {
            widgets = concatArrars([], tempWidget);
        }

        $scope.isDuplicate = function (name) {
            $scope.duplicate = false;
            if (widgets.findIndex(widg => widg.name == name) >= 0)
                $scope.duplicate = true;
            if (name != "")
                $scope.emptyName = false;
        }

        function concatArrars(a, b) {
            var t = JSON.stringify(a.concat(b));
            return JSON.parse(t);
        }

        function valid(widget) {
            $scope.emptyName = $scope.emptyNumber = false;
            var validPairsCnt = 0;

            var disable;
            if (widget.name == "") {
                $scope.emptyName = true;
                disable = true;
            }
            if (widget.number == "") {
                $scope.emptyNumber = true;
                disable = true;
            }
            for (i = widget.pairs.length - 1; i >= 0; i--) {
                pair = widget.pairs[i];
                pair.k = pair.v = false;

                if (pair.key != "" && pair.value != "") {
                    validPairsCnt++;
                }

                else if (pair.key == "" && pair.value == "") {
                    if (i == 0 && validPairsCnt == 0) {
                        pair.k = true;
                        pair.v = true;
                        disable = true;
                    }
                    continue;
                }
                else if (pair.key != "" && pair.value == "") {
                    pair.v = true;
                    disable = true;
                }
                else if (pair.key == "" && pair.value != "") {
                    pair.k = true;
                    disable = true;
                }
            }
            if (disable)
                return false
            return true;
        }
    })

