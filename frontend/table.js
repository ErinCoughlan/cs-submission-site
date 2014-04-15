$(document).ready(function() {
	$('tr.fixedHeader').click(function () {
		toggleRowChildren($(this), 'fixedHeader');
	});

	function toggleRowChildren(parentRowElement, parentClass) {
		console.log(parentRowElement);
		var childClass = parentRowElement.attr('id');
		$('tr.'+childClass, parentRowElement.parent()).toggle();
		$('tr.'+childClass).each(function(){
			if ($(this).hasClass(parentClass) && !$(this).hasClass('collapsed')) {
				toggleRowChildren($(this), parentClass);
			}
		});
		parentRowElement.toggleClass('collapsed');
	}
});

/*
function toggleRow(e) {
		alert(e.target.parentNode);
		toggleRowChildren(e.target.parentNode, 'fixedHeader');
	};

function toggleRowChildren(parentRowElement, parentClass) {
	alert("parentRowElement: " + parentRowElement.id)
	var childClass = parentRowElement.id;
	$('tr.'+childClass, parentRowElement.parentNode).toggle();
	$('tr.'+childClass).each(function(){
		if ($(this).hasClass(parentClass) && !$(this).hasClass('collapsed')) {
			toggleRowChildren($(this), parentClass);
		}
	});
	parentRowElement.toggleClass('collapsed');
};
*/