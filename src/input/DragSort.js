import $ from 'jquery'
import Garnish from 'garnish'

const DragSort = Garnish.Drag.extend({

	init(items, settings)
	{
		if(typeof settings === 'undefined' && $.isPlainObject(items))
		{
			settings = items
			items = null
		}

		settings = $.extend({}, DragSort.defaults, settings)
		this.base(items, settings)
	},

	getHelperTargetX()
	{
		const magnet = this.settings.magnetStrength

		if(magnet != 1)
		{
			const draggeeOffsetX = this.$draggee.offset().left
			return draggeeOffsetX + ((this.mouseX - this.mouseOffsetX - draggeeOffsetX) / magnet)
		}

		return this.base()
	},

	getHelperTargetY()
	{
		const magnet = this.settings.magnetStrength

		if(magnet != 1)
		{
			const draggeeOffsetY = this.$draggee.offset().top
			return draggeeOffsetY + ((this.mouseY - this.mouseOffsetY - draggeeOffsetY) / magnet)
		}

		return this.base()
	},

	onDragStart()
	{
		this.base()
	},

	onDrag()
	{
		this.base()
	},

	onDragStop()
	{
		this.base()
	},

	_getClosestItem()
	{

	}

}, {

	defaults: {
		container: null,
		insertion: null,
		magnetStrength: 1,
		onInsertionPointChange: $.noop,
		onSortChange: $.noop
	}
})

export default DragSort
