/*****************************************************************************/
/*                             Common Utilities                              */
/*****************************************************************************/

/**
 * Generate the initial logo.
 */
function initial($img) {
	var dataName = $img.attr('data-name');
	var seed = (dataName && dataName.length > 1) ? hash_code(dataName.substring(1)) : 0;
	var charCount = dataName.length;
	var fontSize = Math.min(100, ($img.width() * 2) / charCount);

	$img.initial({
		charCount: charCount,
		fontSize: fontSize,
		fontWeight: 700,
		seed: seed,
	});
}
