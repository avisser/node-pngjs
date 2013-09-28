var assert = require('assert');
var util = require('util');
var Packer = require('../lib/packer');
var constants = require('../lib/constants');
var pngjs = require('../lib/png');
var fs = require('fs');

var TestPacker = function (options) {
  Packer.call(this, options);
};
util.inherits(TestPacker, Packer);

function populateWithDummyData(png) {
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;
      var color = 0xe5;
      png.data[idx  ] = color;
      png.data[idx + 1] = color;
      png.data[idx + 2] = color;
      png.data[idx + 3] = 0xff;
    }
  }
}


describe('itxt generation', function () {
  it('should have an itxt', function () {
    TestPacker.prototype._packChunk = function (type, buf) {
      assert.equal(type, constants.TYPE_iTXt);
      assert.equal('abc123', buf.slice(28).toString());
      assert.equal('signature', buf.slice(0, 9).toString());
    };
    var tp = new TestPacker({});
    var chunk = {
      keyword:'signature',
      value:'abc123',
      language: 'en_US',
      translated_keyword: 'signature'
    };
    tp._packiTXt(chunk);
  });

  it('should create a png w/ an itxt section', function() {
    var png = new pngjs.PNG({
      width: 10,
      height:10,
      filterType:-1
    });

    populateWithDummyData(png);
    png.addChunk({keyword: 'signature', value: 'abc123', language: 'en_US', translated_keyword: 'sigz'});

    png.pack().pipe(fs.createWriteStream(__dirname + '/out/out.png'));
  });
});
