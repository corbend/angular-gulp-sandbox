var app = angular.module('myApp.directives');

app.controller('DirectiveCtrl', function($scope) {
    $scope.entity = {};
});

app.run(function($templateCache) {
    $templateCache.put("slider_template.html", [
    	"<div class='rail-wrapper'>",
    	    "<div class='left-edge'></div>",
    		"<div class='knob'></div>",
    		"<div class='rail'>",
	    		"<div class='left-fill'></div>",
	    		"<div class='right-fill'></div>",
    		"</div>",
    		"<div class='right-edge'></div>",
    	"</div>"].join("\r\n"));
})

function getOffsetRect(elem) {
	
	var box = elem.getBoundingClientRect();    
	var body = document.body;
	var docElem = document.documentElement;
	     
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	     
	var clientTop = docElem.clientTop || body.clientTop || 0;
	var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	     
	var top  = box.top +  scrollTop - clientTop;
	var left = box.left + scrollLeft - clientLeft;
    
    return { top: Math.round(top), left: Math.round(left) }
}

app.directive('mpSlider', function($templateCache, $document) {
    return {
        restrict: 'E',
        replace: true,
        require: '?ngModel',
        template: $templateCache.get('slider_template.html'),
        scope: {
            min: '=',
            mxv: '@',
            mnv: '@',
            knobCount: '@',
            knobSize: '@'
        },
        controller: function($scope) {

            $scope.moveKnob = function(e, model) {
                
                if ($scope.knobDrag) {
                    var $rail = $scope.$rail;
                    var $knob = $scope.$knob;
                    var rail = $rail[0];
                    var knob = $knob[0];
                    
                    var x = e.clientX;
                    var y = e.clientY;

                    var railStyle = getComputedStyle(rail);

                    var railWidth = parseInt(railStyle.width); 
                    var knobStyle = getComputedStyle(knob);
                    var knobWidth = parseInt(railStyle.height);

                    $scope.knobLeftPos = x - getOffsetRect(rail).left;
                    
                    if ($scope.knobLeftPos >= knobWidth/2 && $scope.knobLeftPos <= (parseInt(railStyle.width) - knobWidth / 2)) {
                        knob.style.left = String($scope.knobLeftPos - knobWidth / 2) + "px";
                        $scope.$leftFill[0].style.width = $scope.knobLeftPos + 5 + "px";
                        $scope.$apply(function() {
                            var minValue = (($scope.knobLeftPos - knobWidth / 2) / (railWidth - knobWidth)).toFixed(2);

                            var dip = parseInt($scope.mxv) - parseInt($scope.mnv);
                            $scope.silent = true;

                            var viewVal = parseInt($scope.mnv) + Math.floor(dip * minValue);
                            model.$setViewValue(viewVal);

                            $scope.silent = false;

                        });
                    }
                }
            }
        },
        link: function(scope, elm, attrs, ngModel) {
                       
            scope.$this = elm;
            scope.$knob = elm.children().eq(1);
            console.log(elm.children());
            scope.$rail = elm.children().eq(2);
            console.log(scope.$rail);
            scope.$leftFill = scope.$rail.children().eq(0);
            scope.$rightFill = scope.$rail.children().eq(1);
            
            elm.on('mousedown', function(e) {
                scope.knobDrag = true;
                scope.moveKnob(e, ngModel);
            });
            
            elm.on('mouseup', function() {
                scope.knobDrag = false;
            });
            
            $document.on('mousemove', function(e) {
                scope.moveKnob(e, ngModel);
            });
            var $scope = scope;
            
            
            $document.on('mouseup', function() {
                scope.knobDrag = false;
            });

            ngModel.$render = function() {

                var $rail = $scope.$rail;
                var $knob = $scope.$knob;
                var rail = $rail[0];
                var knob = $knob[0];
                var railStyle = getComputedStyle(rail);
                var railWidth = parseInt(railStyle.width);
                var knobStyle = getComputedStyle(knob);
                var knobWidth = parseInt(knobStyle.width);

                var p = getOffsetRect(rail).left + knobWidth / 2;
                var dip = parseInt($scope.mxv) - parseInt($scope.mnv);
                var minValuePx = (parseInt($scope.mxv) - ngModel.$viewValue) / dip;
                var knobPosX = (railWidth - knobWidth / 2) * (1 - minValuePx);
                knob.style.left = knobPosX + "px";
                scope.$leftFill[0].style.width = knobPosX + 5 + "px";

            }
        }
    }
})
