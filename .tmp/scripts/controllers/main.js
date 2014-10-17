(function() {
  'use strict';
  var COLORS, FAMILY, GENUS, LEVELS, Node, ORDER, SPECIES, SUBFAMILY, Viroscope, convertToChildLists, initializeScope,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ORDER = 1;

  FAMILY = 2;

  SUBFAMILY = 3;

  GENUS = 4;

  SPECIES = 5;

  COLORS = ['red', '#253494', '#2c7fb8', '#41b6c4', '#a1dab4', '#ffffcc'];

  LEVELS = ['root', 'order', 'family', 'sub-family', 'genus', 'species'];

  Node = (function() {
    Node.hostAbbrevs = {
      Al: 'Algae',
      Ar: 'Archaea',
      B: 'Bacteria',
      F: 'Fungi',
      I: 'Invertebrates',
      P: 'Plants',
      Pr: 'Protozoa',
      V: 'Vertebrates'
    };

    function Node(name, parent, properties, level) {
      var _this = this;
      this.name = name;
      this.parent = parent;
      this.properties = properties;
      this.level = level;
      this.flatten = __bind(this.flatten, this);
      this.showAccordingToAttributes = __bind(this.showAccordingToAttributes, this);
      this.invertHidden = __bind(this.invertHidden, this);
      this.unpinAll = __bind(this.unpinAll, this);
      this.addMorphologyKeywords = __bind(this.addMorphologyKeywords, this);
      this.computeAllProperties = __bind(this.computeAllProperties, this);
      this.computeFullText = __bind(this.computeFullText, this);
      this.ancestors = __bind(this.ancestors, this);
      this.addChild = __bind(this.addChild, this);
      this.children = [];
      this.hidden = false;
      this.allProperties = null;
      this.format = {
        ancestry: function() {
          var ancestor;
          return ((function() {
            var _i, _len, _ref, _results;
            _ref = this.ancestors();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              ancestor = _ref[_i];
              _results.push(ancestor.name);
            }
            return _results;
          }).call(_this)).filter(function(name) {
            return name !== 'Unassigned';
          }).join(' / ');
        },
        links: function() {
          var _ref;
          return (_ref = _this.allProperties.links) != null ? _ref : [];
        },
        genome: function() {
          var sense;
          if (_this.allProperties.genome == null) {
            return 'not set yet';
          }
          sense = [];
          if (_this.allProperties.genome.positive) {
            sense.push('+');
          }
          if (_this.allProperties.genome.negative) {
            sense.push('-');
          }
          if (_this.allProperties.genome.ambisense) {
            sense.push('+/-');
          }
          return _this.allProperties.genome.type + (_this.allProperties.genome.RT ? '-RT' : '') + (sense.length ? ' (' + sense.join(', ') + ')' : '');
        },
        envelope: function() {
          switch (_this.allProperties.envelope) {
            case 'N/A':
              return 'N/A';
            case 'both':
              return 'both';
            case true:
              return 'yes';
            case false:
              return 'no';
          }
          return '';
        },
        morphology: function() {
          var _ref;
          return (_ref = _this.allProperties.morphology) != null ? _ref : '';
        },
        genomeLength: function() {
          if (_this.allProperties.genome.lengthDescription != null) {
            return _this.allProperties.genome.lengthDescription;
          } else if (angular.isArray(_this.allProperties.genome.length)) {
            return _this.allProperties.genome.length[0] + '-' + _this.allProperties.genome.length[1];
          } else {
            return '';
          }
        },
        genomeConfiguration: function() {
          var _ref;
          if (((_ref = _this.allProperties.genome) != null ? _ref.configurationDescription : void 0) != null) {
            return _this.allProperties.genome.configurationDescription;
          } else {
            return '';
          }
        },
        virionDescription: function() {
          if (_this.allProperties.virionDescription != null) {
            return _this.allProperties.virionDescription;
          } else if (angular.isArray(_this.allProperties.virionSize)) {
            return _this.allProperties.virionSize[0] + '-' + _this.allProperties.virionSize[1];
          } else {
            return '';
          }
        },
        host: function() {
          var host;
          if (_this.allProperties.host != null) {
            return ((function() {
              var _i, _len, _ref, _results;
              _ref = this.allProperties.host;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                host = _ref[_i];
                _results.push(Node.hostAbbrevs[host]);
              }
              return _results;
            }).call(_this)).join(', ');
          } else {
            return '';
          }
        }
      };
    }

    Node.prototype.addChild = function(child) {
      return this.children.push(child);
    };

    Node.prototype.ancestors = function() {
      var node, result;
      result = [];
      node = this;
      while (node.parent) {
        result.push(node);
        node = node.parent;
      }
      return result.reverse();
    };

    Node.prototype.computeFullText = function() {
      var full, property;
      full = [this.name];
      for (property in this.allProperties) {
        if (property !== 'genome') {
          if (typeof this.allProperties[property] !== 'boolean') {
            full.push(JSON.stringify(this.allProperties[property]));
          }
        }
      }
      if (this.allProperties.genome) {
        for (property in this.allProperties.genome) {
          if (typeof this.allProperties.genome[property] !== 'boolean') {
            full.push(JSON.stringify(this.allProperties.genome[property]));
          }
        }
      }
      full.push(JSON.stringify(this.format.host()));
      return full.join(' ').toLowerCase();
    };

    Node.prototype.computeAllProperties = function() {
      var child, _i, _len, _ref, _results;
      this.allProperties = {};
      if (this.parent && this.parent.allProperties) {
        angular.extend(this.allProperties, this.parent.allProperties);
      }
      if (this.properties) {
        angular.extend(this.allProperties, this.properties);
      }
      this.fullText = this.computeFullText();
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.computeAllProperties());
      }
      return _results;
    };

    Node.prototype.addMorphologyKeywords = function() {
      var recurse;
      recurse = function(node) {
        var child, _i, _len, _ref, _results;
        if (node.properties.morphology && !node.properties.morphologyKeywords) {
          node.properties.morphologyKeywords = node.properties.morphology;
        }
        _ref = node.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(recurse(child));
        }
        return _results;
      };
      return recurse(this);
    };

    Node.prototype.unpinAll = function() {
      var child, _i, _len, _ref, _results;
      this.fixed = false;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.unpinAll());
      }
      return _results;
    };

    Node.prototype.invertHidden = function() {
      var hidden, recurse;
      hidden = !this.hidden;
      recurse = function(node) {
        var child, _i, _len, _ref, _results;
        node.hidden = hidden;
        _ref = node.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(recurse(child));
        }
        return _results;
      };
      return recurse(this);
    };

    Node.prototype.showAccordingToAttributes = function($scope) {
      var _ref, _ref1, _ref2;
      return ($scope.searchText.length === 0 || this.fullText.indexOf($scope.searchText.toLowerCase()) > -1) && (this.allProperties.envelope === void 0 || $scope.envelope.enveloped && this.allProperties.envelope || $scope.envelope.notEnveloped && this.allProperties.envelope === false || $scope.envelope.both && this.allProperties.envelope === 'both' || $scope.envelope.NA && this.allProperties.envelope === 'N/A') && (this.allProperties.morphologyKeywords === void 0 || $scope.morphology.allantoid && this.allProperties.morphologyKeywords.indexOf('allantoid') > -1 || $scope.morphology.bacilliform && this.allProperties.morphologyKeywords.indexOf('bacilliform') > -1 || $scope.morphology.bottleShaped && this.allProperties.morphologyKeywords.indexOf('bottle-shaped') > -1 || $scope.morphology.bulletShaped && this.allProperties.morphologyKeywords.indexOf('bullet-shaped') > -1 || $scope.morphology.coiled && this.allProperties.morphologyKeywords.indexOf('coiled') > -1 || $scope.morphology.dropletShaped && this.allProperties.morphologyKeywords.indexOf('droplet-shaped') > -1 || $scope.morphology.filamentous && this.allProperties.morphologyKeywords.indexOf('filamentous') > -1 || $scope.morphology.icosahedral && this.allProperties.morphologyKeywords.indexOf('icosahedral') > -1 || $scope.morphology.icosahedralHead && this.allProperties.morphologyKeywords.indexOf('icosahedral head') > -1 || $scope.morphology.icosahedralCore && this.allProperties.morphologyKeywords.indexOf('icosahedral core') > -1 || $scope.morphology.intracellular && this.allProperties.morphologyKeywords.indexOf('intracellular') > -1 || $scope.morphology.rnp && this.allProperties.morphologyKeywords.indexOf('RNP complex') > -1 || $scope.morphology.lemonShaped && this.allProperties.morphologyKeywords.indexOf('lemon-shaped') > -1 || $scope.morphology.ovoidal && this.allProperties.morphologyKeywords.indexOf('ovoidal') > -1 || $scope.morphology.pleomorphic && this.allProperties.morphologyKeywords.indexOf('pleomorphic') > -1 || $scope.morphology.prolateEllipsoid && this.allProperties.morphologyKeywords.indexOf('prolate ellipsoid') > -1 || $scope.morphology.pseudoIcosahedral && this.allProperties.morphologyKeywords.indexOf('pseudo-icosahedral') > -1 || $scope.morphology.quasiSpherical && this.allProperties.morphologyKeywords.indexOf('quasi-spherical') > -1 || $scope.morphology.rodShaped && this.allProperties.morphologyKeywords.indexOf('rod-shaped') > -1 || $scope.morphology.shortTail && this.allProperties.morphologyKeywords.indexOf('short tail') > -1 || $scope.morphology.spherical && this.allProperties.morphologyKeywords.indexOf('spherical') > -1 || $scope.morphology.tail && this.allProperties.morphologyKeywords.indexOf('tail') > -1 || $scope.morphology.twoTailed && this.allProperties.morphologyKeywords.indexOf('two-tailed') > -1) && (this.allProperties.host === void 0 || $scope.host.algae && __indexOf.call(this.allProperties.host, 'Al') >= 0 || $scope.host.archaea && __indexOf.call(this.allProperties.host, 'Ar') >= 0 || $scope.host.bacteria && __indexOf.call(this.allProperties.host, 'B') >= 0 || $scope.host.fungi && __indexOf.call(this.allProperties.host, 'F') >= 0 || $scope.host.invertebrates && __indexOf.call(this.allProperties.host, 'I') >= 0 || $scope.host.plants && __indexOf.call(this.allProperties.host, 'P') >= 0 || $scope.host.protozoa && __indexOf.call(this.allProperties.host, 'Pr') >= 0 || $scope.host.vertebrates && __indexOf.call(this.allProperties.host, 'V') >= 0) && (((_ref = this.allProperties.genome) != null ? _ref.type : void 0) === void 0 || $scope.genome.ssDNAPositive && this.allProperties.genome.type === 'ssDNA' && this.allProperties.genome.positive || $scope.genome.ssDNANegative && this.allProperties.genome.type === 'ssDNA' && this.allProperties.genome.negative || $scope.genome.ssDNANegativeOrAmbi && this.allProperties.genome.type === 'ssDNA' && (this.allProperties.genome.negative || this.allProperties.genome.ambisense) || $scope.genome.ssDNAAmbi && this.allProperties.genome.type === 'ssDNA' && this.allProperties.genome.ambisense || $scope.genome.dsDNA && this.allProperties.genome.type === 'dsDNA' || $scope.genome.dsDNART && this.allProperties.genome.type === 'dsDNA' && this.allProperties.genome.RT || $scope.genome.ssRNAPositive && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.positive || $scope.genome.ssRNARTPositive && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.RT && this.allProperties.genome.positive || $scope.genome.ssRNANegative && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.negative || $scope.genome.ssRNAAmbi && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.ambisense || $scope.genome.dsRNA && this.allProperties.genome.type === 'dsRNA') && (((_ref1 = this.allProperties.genome) != null ? _ref1.type : void 0) === void 0 || $scope.genome.baltimore[0] && this.allProperties.genome.type === 'dsDNA' && !this.allProperties.genome.RT || $scope.genome.baltimore[1] && this.allProperties.genome.type === 'ssDNA' || $scope.genome.baltimore[2] && this.allProperties.genome.type === 'dsRNA' || $scope.genome.baltimore[3] && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.positive && !this.allProperties.genome.RT || $scope.genome.baltimore[4] && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.negative || $scope.genome.baltimore[5] && this.allProperties.genome.type === 'ssRNA' && this.allProperties.genome.positive && this.allProperties.genome.RT || $scope.genome.baltimore[6] && this.allProperties.genome.type === 'dsDNA' && this.allProperties.genome.RT) && (((_ref2 = this.allProperties.genome) != null ? _ref2.configurationDescription : void 0) === void 0 || $scope.genomeOrganization.linear && this.allProperties.genome.configurationDescription.toLowerCase().indexOf('linear') > -1 || $scope.genomeOrganization.circular && this.allProperties.genome.configurationDescription.toLowerCase().indexOf('circular') > -1 || $scope.genomeOrganization.coiled && this.allProperties.genome.configurationDescription.toLowerCase().indexOf('coiled') > -1 || $scope.genomeOrganization.segmented && this.allProperties.genome.configurationDescription.toLowerCase().indexOf('segments') > -1) && (this.allProperties.virionSize[1] >= $scope.morphologySlider.sliderMin && this.allProperties.virionSize[0] <= $scope.morphologySlider.sliderMax) && (this.allProperties.genome.length[1] >= $scope.genomeSlider.sliderMin && this.allProperties.genome.length[0] <= $scope.genomeSlider.sliderMax);
    };

    Node.prototype.flatten = function($scope) {
      var i, links, nodes, recurse,
        _this = this;
      nodes = [];
      links = [];
      i = 0;
      recurse = function(node, parent) {
        var child, hidden, _i, _len, _ref, _results;
        if (!node.id) {
          node.id = i++;
        }
        hidden = node.hidden || !node.showAccordingToAttributes($scope) || (node.level === SUBFAMILY && node.name === 'Unassigned') || (!$scope.displayUnassignedNodes[0] && node.name === 'Unassigned') || !$scope.taxonomy[node.level];
        if (!hidden) {
          nodes.push(node);
          if (parent != null) {
            links.push({
              level: node.level,
              source: parent,
              target: node
            });
          }
        }
        _ref = node.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(recurse(child, (hidden ? parent : node)));
        }
        return _results;
      };
      recurse(this, null);
      return {
        nodes: nodes,
        links: links
      };
    };

    return Node;

  })();

  Viroscope = (function() {
    function Viroscope() {
      this.refresh = __bind(this.refresh, this);
      this.keydown = __bind(this.keydown, this);
      this.dragend = __bind(this.dragend, this);
      this.dragstart = __bind(this.dragstart, this);
      this.unpinAll = __bind(this.unpinAll, this);
      this.tick = __bind(this.tick, this);
      this.mouseOverNode = __bind(this.mouseOverNode, this);
      this.mouseOffNode = __bind(this.mouseOffNode, this);
      this.mousedown = __bind(this.mousedown, this);
      this.rescale = __bind(this.rescale, this);
      var height, svg, width;
      this.$scope = null;
      this.root = null;
      this.selectedNode = null;
      width = 1050;
      height = 350;
      this.force = d3.layout.force().size([width, height]).charge(-150).linkDistance(80).on('tick', this.tick);
      this.drag = this.force.drag().on('dragstart', this.dragstart).on('dragend', this.dragend);
      svg = d3.select('#viroscope').append('svg').attr('class', 'main-view').attr('width', width).attr('height', height).attr('width', '100%').attr('height', '85%').attr('viewBox', '0 0 ' + width + ' ' + height).attr('preserveAspectRatio', 'xMidYMid').attr('pointer-events', 'all').call(d3.behavior.zoom().on('zoom', this.rescale));
      this.vis = svg.append('svg:g');
      this.link = this.vis.selectAll('.link');
      this.node = this.vis.selectAll('.node');
      d3.select(window).on('keydown', this.keydown);
    }

    Viroscope.prototype.rescale = function() {
      var scale, trans;
      trans = d3.event.translate;
      scale = d3.event.scale;
      return this.vis.attr('transform', "translate(" + trans + ") scale(" + scale + ")");
    };

    Viroscope.prototype.mousedown = function() {
      return this.vis.call(d3.behavior.zoom().on('zoom', this.rescale));
    };

    Viroscope.prototype.mouseOffNode = function(d) {
      this.selectedNode = null;
      if (!this.$scope.infoNodeLocked) {
        this.$scope.infoNode = null;
        return this.$scope.$apply();
      }
    };

    Viroscope.prototype.mouseOverNode = function(d) {
      if (d.name !== 'root') {
        this.selectedNode = d;
        if (!this.$scope.infoNodeLocked) {
          this.$scope.infoNode = d;
          return this.$scope.$apply();
        }
      }
    };

    Viroscope.prototype.tick = function() {
      this.link.attr('x1', function(d) {
        return d.source.x;
      }).attr('y1', function(d) {
        return d.source.y;
      }).attr('x2', function(d) {
        return d.target.x;
      }).attr('y2', function(d) {
        return d.target.y;
      });
      return this.node.attr('transform', function(d) {
        return "translate(" + d.x + ", " + d.y + ")";
      });
    };

    Viroscope.prototype.unpinAll = function() {
      this.root.unpinAll();
      return this.$scope.nodesPinned = 0;
    };

    Viroscope.prototype.dragstart = function(d) {
      this.dragStartTime = Date.now();
      return d3.event.sourceEvent.stopPropagation();
    };

    Viroscope.prototype.dragend = function(d) {
      var child, elapsed, _i, _len, _ref;
      elapsed = Date.now() - this.dragStartTime;
      if (elapsed > 150) {
        d.fixed = true;
        return this.$scope.nodesPinned++;
      } else {
        _ref = d.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          child.invertHidden();
        }
        return this.refresh();
      }
    };

    Viroscope.prototype.keydown = function() {
      if (d3.event.keyCode === 191) {
        d3.event.preventDefault();
        document.getElementById('search-input').focus();
      }
      if (!this.selectedNode) {
        return;
      }
      switch (d3.event.keyCode) {
        case 65:
          return console.log('Selected node', this.selectedNode);
        case 76:
          this.$scope.infoNode = this.selectedNode;
          this.$scope.infoNodeLocked = true;
          return this.$scope.$apply();
        case 80:
          this.selectedNode.fixed = true;
          return this.$scope.nodesPinned++;
        case 82:
          this.selectedNode.fixed = false;
          this.$scope.nodesPinned--;
          return this.$scope.$apply();
        case 85:
          this.$scope.infoNodeLocked = false;
          this.$scope.infoNode = this.selectedNode;
          return this.$scope.$apply();
      }
    };

    Viroscope.prototype.getCounts = function(nodes) {
      var node, result, _i, _len;
      result = [0, 0, 0, 0, 0, 0];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        if (node.name !== 'Unassigned') {
          result[node.level]++;
        }
      }
      return this.$scope.counts = result;
    };

    Viroscope.prototype.refresh = function(data, $scope) {
      var f, links, nodeEnter, nodes;
      if (data) {
        this.root = data;
        this.$scope = $scope;
      }
      f = this.root.flatten(this.$scope);
      nodes = f.nodes;
      links = f.links;
      this.getCounts(nodes);
      this.force.nodes(nodes).links(links);
      this.link = this.link.data(links);
      this.link.exit().remove();
      this.link.enter().insert('line', '.node').attr('class', 'link');
      this.node = this.node.data(nodes, function(d) {
        return d.id;
      }).call(this.drag);
      this.node.exit().remove();
      nodeEnter = this.node.enter().append('g').attr('class', 'node');
      nodeEnter.append('circle').attr('r', 6).on('mouseover', this.mouseOverNode).on('mouseout', this.mouseOffNode);
      nodeEnter.append('text').attr('dy', '1.5em').text(function(d) {
        if (d.name === 'Unassigned') {
          return LEVELS[d.level] + ' not assigned';
        } else {
          return d.name;
        }
      });
      this.node.select('circle').style('fill', function(d) {
        return COLORS[d.level];
      });
      return this.force.start();
    };

    return Viroscope;

  })();

  convertToChildLists = function(tree) {
    var convertNodeToList;
    convertNodeToList = function(name, node, level, parent) {
      var childName, newNode, nextLevel, properties, _ref;
      properties = (_ref = node.properties) != null ? _ref : {};
      newNode = new Node(name, parent, properties, level);
      if (level !== SPECIES) {
        nextLevel = LEVELS[level + 1];
        for (childName in node[nextLevel]) {
          newNode.addChild(convertNodeToList(childName, node[nextLevel][childName], level + 1, newNode));
        }
      }
      return newNode;
    };
    return convertNodeToList('root', tree, 0, null);
  };

  initializeScope = function($scope) {
    $scope.taxonomy = [true, true, true, true, false, false];
    $scope.searchText = '';
    $scope.displayUnassignedNodes = [true];
    $scope.nodesPinned = 0;
    $scope.infoNode = null;
    $scope.infoNodeLocked = false;
    $scope.counts = [0, 0, 0, 0, 0, 0];
    $scope.morphology = {
      allantoid: true,
      bacilliform: true,
      bottleShaped: true,
      bulletShaped: true,
      coiled: true,
      dropletShaped: true,
      filamentous: true,
      icosahedral: true,
      icosahedralHead: true,
      icosahedralCore: true,
      intracellular: true,
      rnp: true,
      lemonShaped: true,
      ovoidal: true,
      pleomorphic: true,
      prolateEllipsoid: true,
      pseudoIcosahedral: true,
      quasiSpherical: true,
      rodShaped: true,
      shortTail: true,
      spherical: true,
      tail: true,
      twoTailed: true
    };
    $scope.morphologySlider = {
      minWidth: 1,
      maxWidth: 100,
      sliderMin: 1,
      sliderMax: 100
    };
    $scope.envelope = {
      enveloped: true,
      notEnveloped: true,
      both: true,
      NA: true
    };
    $scope.host = {
      algae: true,
      archaea: true,
      bacteria: true,
      fungi: true,
      invertebrates: true,
      plants: true,
      protozoa: true,
      vertebrates: true
    };
    $scope.genomeOrganization = {
      linear: true,
      circular: true,
      coiled: true,
      segmented: true
    };
    $scope.genome = {
      ssDNAPositive: true,
      ssDNANegative: true,
      ssDNANegativeOrAmbi: true,
      ssDNAAmbi: true,
      dsDNA: true,
      dsDNART: true,
      ssRNAPositive: true,
      ssRNARTPositive: true,
      ssRNANegative: true,
      ssRNAAmbi: true,
      dsRNA: true,
      baltimore: [true, true, true, true, true, true, true]
    };
    $scope.genomeSlider = {
      minWidth: 1,
      maxWidth: 100,
      sliderMin: 1,
      sliderMax: 100
    };
    $scope.setAllGenome = function(value) {
      var name;
      for (name in $scope.genome) {
        if (name !== 'baltimore') {
          $scope.genome[name] = value;
        }
      }
      $scope.genome.baltimore = [value, value, value, value, value, value, value];
      return $scope.viroscope.refresh();
    };
    $scope.setAll = function(attr, value) {
      var name;
      for (name in $scope[attr]) {
        $scope[attr][name] = value;
      }
      return $scope.viroscope.refresh();
    };
    $scope.unlockInfoNode = function() {
      return $scope.infoNodeLocked = false;
    };
    return $scope.unpinAll = function() {
      return $scope.viroscope.unpinAll();
    };
  };

  angular.module('viroscope-app').controller('MainCtrl', function($scope, $http) {
    $scope.viroscope = new Viroscope;
    initializeScope($scope);
    return $http.get('/api/taxonomy').success(function(taxonomy) {
      var root;
      root = convertToChildLists(taxonomy);
      root.addMorphologyKeywords();
      root.computeAllProperties();
      $scope._converted = root;
      $scope.morphologySlider.minWidth = $scope.morphologySlider.sliderMin = root.allProperties.virionSize[0];
      $scope.morphologySlider.maxWidth = $scope.morphologySlider.sliderMax = root.allProperties.virionSize[1];
      $scope.genomeSlider.minWidth = $scope.genomeSlider.sliderMin = root.allProperties.genome.length[0];
      $scope.genomeSlider.maxWidth = $scope.genomeSlider.sliderMax = root.allProperties.genome.length[1];
      $scope.$watch('morphologySlider.sliderMax', function() {
        return $scope.viroscope.refresh();
      });
      $scope.$watch('morphologySlider.sliderMin', function() {
        return $scope.viroscope.refresh();
      });
      $scope.$watch('genomeSlider.sliderMax', function() {
        return $scope.viroscope.refresh();
      });
      $scope.$watch('genomeSlider.sliderMin', function() {
        return $scope.viroscope.refresh();
      });
      return $scope.viroscope.refresh(root, $scope);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=main.js.map
*/