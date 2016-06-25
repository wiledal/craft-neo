import $ from 'jquery'
import Garnish from 'garnish'

const debug = false

const BlockSort = Garnish.Drag.extend({

	$container: null,
	blocks: null,

	_draggeeBlock: null,

	init(items, settings)
	{
		if(typeof settings === 'undefined' && $.isPlainObject(items))
		{
			settings = items
			items = null
		}

		settings = $.extend({}, BlockSort.defaults, settings)
		settings.axis = Garnish.Y_AXIS

		this.base(items, settings)

		this.$container = settings.container
		this.blocks = []

		if(debug)
		{
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
				this.mouseY = e.pageY

				const midpoint = this._getClosestMidpoint()
				$marker.css('top', midpoint.position + 'px')
				$marker.text(midpoint.type + ' - ' + midpoint.block.getId() + ' (' + midpoint.block.getBlockType().getHandle() + ')')
			})
		}
	},

	getHelperTargetX()
	{
		return this.$draggee.offset().left
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

	getBlockByElement($block)
	{
		return this.blocks.find(block => block.$container.is($block))
	},

	onDragStart()
	{
		this._draggeeBlock = this.getBlockByElement(this.$draggee[0])

		this.base()
	},

	onDrag()
	{
		const midpoint = this._getClosestMidpoint()

		if(midpoint.block !== this._draggeeBlock)
		{
			this._moveDraggeeToBlock(midpoint.block, midpoint.type)
		}

		this.base()
	},

	onDragStop()
	{
		const that = this
		this.$draggee.each(function()
		{
			const $block = $(this)
			const block = that.getBlockByElement($block)
			const isRoot = $block.parent().is(that.$container)

			if(isRoot)
			{
				block.setLevel(0)
			}
			else
			{
				const $parentBlock = $block.parent().closest('.ni_block')
				const parentBlock = that.getBlockByElement($parentBlock)

				block.setLevel(parentBlock.getLevel() + 1)
			}
		})

		this.returnHelpersToDraggees()

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
		const margin = 10

		let closest = {
			block: null,
			position: 0,
			distance: Number.MAX_VALUE,
			type: BlockSort.TYPE_CONTENT
		}

		for(let block of this.blocks)
		{
			if(!this.$draggee.is(block.$container) || block === this._draggeeBlock)
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
		}

		const endMidpoint = this.$container.offset().top + this.$container.height() + (margin / 2)
		const endDistance = Math.abs(this.mouseY - endMidpoint)

		if(endDistance < closest.distance)
		{
			closest.block = null
			closest.position = endMidpoint
			closest.distance = endDistance
			closest.type = BlockSort.TYPE_END
		}

		return closest
	},

	_getBlockMidpoints(block)
	{
		const border = 1
		const margin = 10
		const padding = 14

		const offset = block.$container.offset().top

		const isExpanded = block.isExpanded()

		const blockHeight = block.$container.height()
		const topbarHeight = block.$topbarContainer.height()
		const contentHeight = isExpanded ? block.$contentContainer.height() : 0
		const childrenHeight = isExpanded ? block.$childrenContainer.height() : 0

		const midpoints = {}
		midpoints[BlockSort.TYPE_CONTENT] = offset + (topbarHeight + contentHeight) / 2

		if(childrenHeight > 0 && block.isExpanded())
		{
			const buttonsHeight = block.getButtons().$container.height()
			midpoints[BlockSort.TYPE_CHILDREN] = offset + blockHeight - border - (padding + buttonsHeight + margin) / 2
		}

		return midpoints
	},

	_moveDraggeeToBlock: function(block, type = BlockSort.TYPE_CONTENT)
	{
		switch(type)
		{
			case BlockSort.TYPE_CHILDREN:
			{
				block.$blocksContainer.append(this.$draggee)
			}
			break
			case BlockSort.TYPE_END:
			{
				this.$container.append(this.$draggee)
			}
			break
			default:
			{
				block.$container.before(this.$draggee)
			}
		}

		this._updateHelperAppearance()
	},

	_updateHelperAppearance()
	{
		for(let $helper of this.helpers)
		{
			const id = $helper.data('neo-b-id')
			const block = this.blocks.find(b => b.$container.data('neo-b-id') == id)

			$helper.css({
				width: block.$container.width() + 1,
				height: block.$container.height()
			})
		}
	}

}, {

	TYPE_CONTENT: 'content',
	TYPE_CHILDREN: 'children',
	TYPE_END: 'end',

	defaults: {
		container: null,
		magnetStrength: 1
	}
})

export default BlockSort
