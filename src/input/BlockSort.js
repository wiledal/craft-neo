import $ from 'jquery'
import Garnish from 'garnish'

const DragSort = Garnish.Drag.extend({

	blocks: null,

	init(items, settings)
	{
		if(typeof settings === 'undefined' && $.isPlainObject(items))
		{
			settings = items
			items = null
		}

		settings = $.extend({}, DragSort.defaults, settings)
		this.base(items, settings)

		this.blocks = []

		const $marker = $('<div>').css({
			position: 'absolute',
			zIndex: 9999,
			left: 0,
			right: 0,
			borderTop: '1px solid red',
			textAlign: 'right',
			fontFamily: 'monospace'
		})

		Garnish.$bod.append($marker)
		Garnish.$bod.on('mousemove', e =>
		{
			this.mouseX = e.pageX
			this.mouseY = e.pageY

			const midpoint = this._getClosestMidpoint()
			$marker.css('top', midpoint.position + 'px')
			$marker.text(midpoint.type + ' - ' + midpoint.block.getId() + ' (' + midpoint.block.getBlockType().getHandle() + ')')
		})
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

	addBlock(block)
	{
		this.blocks.push(block)

		this.addItems(block.$container)
	},

	removeBlock(block)
	{
		this.blocks = this.blocks.filter(b => b !== block)

		this.removeItems(block.$container)
	},

	_getClosestMidpoint()
	{
		let closest = {
			block: null,
			position: 0,
			distance: Number.MAX_VALUE,
			type: 'content'
		}

		for(let block of this.blocks)
		{
			const midpoints = this._getBlockMidpoints(block)

			for(let type of Object.keys(midpoints))
			{
				const midpoint = midpoints[type]
				const distance = Math.abs(this.mouseY - midpoint)

				if(distance < closest.distance)
				{
					closest.block = block
					closest.position = midpoint
					closest.distance = distance
					closest.type = type
				}
			}
		}

		return closest
	},

	_getBlockMidpoints(block)
	{
		const border = 1
		const margin = 10
		const padding = 14

		const offset = block.$container.offset().top;

		const blockHeight = block.$container.height()
		const topbarHeight = block.$topbarContainer.height()
		const contentHeight = block.$contentContainer.height()
		const childrenHeight = block.$childrenContainer.height()

		const midpoints = {
			content: offset + (topbarHeight + contentHeight) / 2
		}

		if(childrenHeight > 0)
		{
			const buttonsHeight = block.getButtons().$container.height()

			midpoints.childrenTop = offset + topbarHeight + contentHeight + border + (padding / 2)
			midpoints.childrenBottom = offset + blockHeight - border - (padding + buttonsHeight + margin) / 2
		}

		return midpoints
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
