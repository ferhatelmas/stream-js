import expect from 'expect.js';

import errors from '../../../src/lib/errors';
import { init, beforeEachFn } from '../utils/hooks';

function mockedFile(size = 1024, name = 'file.txt', mimeType = 'plain/txt') {
  return new File(['x'.repeat(size)], name, { type: mimeType });
}

async function mockedImage(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  context.fillStyle = '#000000';
  context.fillRect(0, 0, size, size);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => {
      const file = new File([blob], 'x.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png'),
  );
}

describe('[INTEGRATION] Stream client (Browser)', function () {
  init.call(this);
  beforeEach(beforeEachFn);

  it('add activity using to', function () {
    const activity = {
      actor: 1,
      verb: 'add',
      object: 1,
      to: [this.flat3.id],
      participants: ['Thierry', 'Tommaso'],
      route: {
        name: 'Vondelpark',
        distance: '20',
      },
    };

    return this.user1
      .addActivity(activity)
      .then((body) => {
        activity.id = body.id;
        return this.flat3.get({ limit: 1 });
      })
      .then((body) => {
        expect(body.results[0].id).to.eql(activity.id);
      });
  });

  describe('#upload', function () {
    it('should upload a file', function (done) {
      this.browserClient
        .upload('files/', mockedFile())
        .then(({ file }) => {
          expect(file).to.be.a('string');
          done();
        })
        .catch((err) => done(err));
    });

    it('should upload an image', function (done) {
      mockedImage()
        .then((file) => this.browserClient.upload('images/', file))
        .then(({ file }) => {
          expect(file).to.be.a('string');
          done();
        })
        .catch((err) => done(err));
    });

    it('should error for a bad image', function (done) {
      this.browserClient
        .upload('images/', mockedFile())
        .then(() => {
          throw new Error('should be Stream error');
        })
        .catch((err) => {
          expect(err).to.be.a(errors.StreamApiError);
          expect(err.error.status_code).to.be(400);
          expect(err.error.code).to.be(4);
          done();
        });
    });
  });
});
