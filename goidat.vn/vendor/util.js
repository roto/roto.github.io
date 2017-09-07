/*****************************************************************************/
/*                             Common Utilities                              */
/*****************************************************************************/

/**
 * Generate the initial logo.
 */
function initial($img) {
	var charCount = $img.attr('data-name').length;
	var foneSize = Math.min(100, ($img.width() * 2) / charCount);
	$img.initial({
		charCount: charCount,
		fontSize: foneSize,
		fontWeight: 700,
	});
}
