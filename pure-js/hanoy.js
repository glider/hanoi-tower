(function(win) {
	"use strict";

	var _ = win._,
		doc = win.document;

	function Column(container, disks) {
		this.el = container;
		container.objColumn = this;
		this.state = [];
		_.each(disks, this.unshift, this);
	}
	_.extend(Column.prototype, {
		isEmpty: function() {
			return this.state.length === 0;
		},

		shift: function() {
			return this.isEmpty() ? null : this.state.shift();
		},

		testUnshift: function(disk) {
			return this.isEmpty() || (disk.size > this.state[0].size);
		},

		unshift: function(disk) {
			if (!this.testUnshift(disk)) {
				throw new Error("Перемещаемый диск большего размера.");
			}
			this.state.unshift(disk);

			var diskEl = disk.getEl();
			diskEl.style.bottom = ((this.state.length - 1) * 22) + 'px';
			this.el.appendChild(diskEl);

			return this.state.length;
		},

		triggerSelected: function(status) {
			this.el.classList[status ? 'add' : 'remove']('selected');
		}
	});

	function Disk(size) {
		this.size = size;
	}

	_.extend(Disk.prototype, {
		getEl: function() {
			return this.el = this.el || this.buildEl();
		},

		buildEl: function() {
			var elDisk = doc.createElement('div');
			elDisk.classList.add('disk');
			elDisk.classList.add('disk' + this.size);
			return elDisk;
		}
	});


	function Hanoy(container, config) {
		_.bindAll(this, 'onClick');
		this.container = container;
		this.elMessage = this.container.getElementsByClassName('informer')[0];
		this.source = null;
		this.configure(config);
	}

	_.extend(Hanoy.prototype, {
		start: function() {
			this.container.addEventListener('click', this.onClick, false);
			this.showMessage("Задача: перенести все диски на другой стержень.<br/>Перемещать можно только по одному диску.<br/> Опустить диск можно только на диск большего размера.")
		},

		configure: function(config) {
			var elCols = this.container.getElementsByClassName("column");
			this.columns = _.map([0,1,2], function(index) {
				var diskSet = _.map(config[index], function(id) {
					return new Disk(id);
				});
				return new Column(elCols[index], diskSet);
			});
		},

		onClick: function(e) {
			e = e || event;
			var target = e.target || e.srcElement;

			while(target !== this.container) {
				if (target.classList.contains('column')) {
					this.onSelectColumn(target.objColumn);
				}
				target = target.parentNode
			}
		},

		onSelectColumn: function(column) {
			this.showMessage(false);
			if (!this.source) {
				this.setSource(column);
			} else if (this.source === column) {
				this.clearSource();
			} else {
				this.moveDisk(column);
			}
		},

		clearSource: function() {
			this.source.triggerSelected(false);
			this.source = null;
		},

		setSource: function(src) {
			if (!src.isEmpty()) {
				this.source = src;
				src.triggerSelected(true);
			} else {
				this.showMessage("На стержне нет дисков. Выберите другой.");
			}
		},

		moveDisk: function(target) {
			var disk = this.source.shift();
			try {
				target.unshift(disk);
			} catch(e) {
				this.source.unshift(disk);
				this.showMessage(e.message);
			} finally {
				this.clearSource();
				this.testComplete();
			}
		},

		testComplete: function() {
			var res = _.invoke(this.columns, 'isEmpty');
			if ( res[0] && (res[1] || res[2]) ) {
				this.showMessage("УРА! Победа!!!");
			}
		},

		showMessage: function(msg) {
			if (msg) {
				this.elMessage.innerHTML = msg;
				this.elMessage.style.display = 'block';
			} else {
				this.elMessage.style.display = 'none';
			}
		}
	});

	function init() {
		var elBoard = doc.getElementById("wrap");
		var config = [[1, 2, 3, 4, 5, 6, 7], [], []]; // Тут можно установить любое начальное состояние.
		var hanoy = new Hanoy(elBoard, config);
		hanoy.start();

// В принципе, получилось запустить и второй экземпляр, как-бы оно вышло как виджет... )
// если интересно - надо снять комменты тут и в index.html
//	var config2 = [[1, 2, 7], [3, 6], [4, 5]];
//	var hanoy2 = new Hanoy(doc.getElementById("wrap2"), config2);
//	hanoy2.start();
	}

	doc.addEventListener('DOMContentLoaded', init);

})(this);
