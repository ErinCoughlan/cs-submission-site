$(document).ready(function() {
	$('tr.fixedHeader').click(function () { 
		toggleRowChildren($(this), 'fixedHeader');
	});

	function toggleRowChildren(parentRowElement, parentClass) {
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
