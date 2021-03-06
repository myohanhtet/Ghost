var should = require('should'), // jshint ignore:line
    sinon = require('sinon'),
    Promise = require('bluebird'),
    configUtils = require('../../utils/configUtils'),

// Stuff we are testing
    helpers = require('../../../server/helpers'),
    api = require('../../../server/api'),

    sandbox = sinon.sandbox.create();

describe('{{url}} helper', function () {
    var rendered;

    before(function () {
        configUtils.set({url: 'http://testurl.com/'});
    });

    beforeEach(function () {
        rendered = null;
        sandbox.stub(api.settings, 'read', function () {
            return Promise.resolve({settings: [{value: '/:slug/'}]});
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    after(function () {
        configUtils.restore();
    });

    it('should return the slug with a prefix slash if the context is a post', function () {
        rendered = helpers.url.call({
            html: 'content',
            markdown: 'ff',
            title: 'title',
            slug: 'slug',
            created_at: new Date(0),
            url: '/slug/'
        });

        should.exist(rendered);
        rendered.string.should.equal('/slug/');
    });

    it('should output an absolute URL if the option is present', function () {
        rendered = helpers.url.call(
            {html: 'content', markdown: 'ff', title: 'title', slug: 'slug', url: '/slug/', created_at: new Date(0)},
            {hash: {absolute: 'true'}}
        );

        should.exist(rendered);
        rendered.string.should.equal('http://testurl.com/slug/');
    });

    it('should output an absolute URL with https if the option is present and secure', function () {
        rendered = helpers.url.call(
            {
                html: 'content', markdown: 'ff', title: 'title', slug: 'slug',
                url: '/slug/', created_at: new Date(0), secure: true
            },
            {hash: {absolute: 'true'}}
        );

        should.exist(rendered);
        rendered.string.should.equal('https://testurl.com/slug/');
    });

    it('should output an absolute URL with https if secure', function () {
        rendered = helpers.url.call(
            {
                html: 'content', markdown: 'ff', title: 'title', slug: 'slug',
                url: '/slug/', created_at: new Date(0), secure: true
            },
            {hash: {absolute: 'true'}}
        );

        should.exist(rendered);
        rendered.string.should.equal('https://testurl.com/slug/');
    });

    it('should return the slug with a prefixed /tag/ if the context is a tag', function () {
        rendered = helpers.url.call({
            name: 'the tag',
            slug: 'the-tag',
            description: null,
            parent: null
        });

        should.exist(rendered);
        rendered.string.should.equal('/tag/the-tag/');
    });

    it('should return / if not a post or tag', function () {
        rendered = helpers.url.call({markdown: 'ff', title: 'title', slug: 'slug'});
        should.exist(rendered);
        rendered.string.should.equal('/');

        rendered = helpers.url.call({html: 'content', title: 'title', slug: 'slug'});
        should.exist(rendered);
        rendered.string.should.equal('/');

        rendered = helpers.url.call({html: 'content', markdown: 'ff', slug: 'slug'});
        should.exist(rendered);
        rendered.string.should.equal('/');

        rendered = helpers.url.call({html: 'content', markdown: 'ff', title: 'title'});
        should.exist(rendered);
        rendered.string.should.equal('/');
    });

    it('should return a relative url if passed through a nav context', function () {
        rendered = helpers.url.call(
            {url: '/foo', label: 'Foo', slug: 'foo', current: true});
        should.exist(rendered);
        rendered.string.should.equal('/foo');
    });

    it('should return an absolute url if passed through a nav context', function () {
        rendered = helpers.url.call(
            {url: '/bar', label: 'Bar', slug: 'bar', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('http://testurl.com/bar');
    });

    it('should return an absolute url with https if context is secure', function () {
        rendered = helpers.url.call(
            {url: '/bar', label: 'Bar', slug: 'bar', current: true, secure: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('https://testurl.com/bar');
    });

    it('external urls should be retained in a nav context', function () {
        rendered = helpers.url.call(
            {url: 'http://casper.website/baz', label: 'Baz', slug: 'baz', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('http://casper.website/baz');
    });

    it('should handle hosted urls in a nav context', function () {
        rendered = helpers.url.call(
            {url: 'http://testurl.com/qux', label: 'Qux', slug: 'qux', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('http://testurl.com/qux');
    });

    it('should handle hosted urls in a nav context with secure', function () {
        rendered = helpers.url.call(
            {
                url: 'http://testurl.com/qux', label: 'Qux', slug: 'qux', current: true,
                secure: true
            },
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('https://testurl.com/qux');
    });

    it('should handle hosted https urls in a nav context with secure', function () {
        rendered = helpers.url.call(
            {
                url: 'https://testurl.com/qux', label: 'Qux', slug: 'qux', current: true,
                secure: true
            },
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('https://testurl.com/qux');
    });

    it('should handle hosted urls with the wrong protocol in a nav context', function () {
        rendered = helpers.url.call(
            {url: 'https://testurl.com/quux', label: 'Quux', slug: 'quux', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('http://testurl.com/quux');
    });

    it('should pass through protocol-less URLs regardless of absolute setting', function () {
        rendered = helpers.url.call(
            {url: '//casper.website/baz', label: 'Baz', slug: 'baz', current: true},
            {hash: {}});
        should.exist(rendered);
        rendered.string.should.equal('//casper.website/baz');

        rendered = helpers.url.call(
            {url: '//casper.website/baz', label: 'Baz', slug: 'baz', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('//casper.website/baz');
    });

    it('should pass through URLs with alternative schemes regardless of absolute setting', function () {
        rendered = helpers.url.call(
            {url: 'tel:01234567890', label: 'Baz', slug: 'baz', current: true},
            {hash: {}});
        should.exist(rendered);
        rendered.string.should.equal('tel:01234567890');

        rendered = helpers.url.call(
            {url: 'mailto:example@ghost.org', label: 'Baz', slug: 'baz', current: true},
            {hash: {}});
        should.exist(rendered);
        rendered.string.should.equal('mailto:example@ghost.org');

        rendered = helpers.url.call(
            {url: 'tel:01234567890', label: 'Baz', slug: 'baz', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('tel:01234567890');

        rendered = helpers.url.call(
            {url: 'mailto:example@ghost.org', label: 'Baz', slug: 'baz', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('mailto:example@ghost.org');
    });

    it('should pass through anchor-only URLs  regardless of absolute setting', function () {
        rendered = helpers.url.call(
            {url: '#thatsthegoodstuff', label: 'Baz', slug: 'baz', current: true},
            {hash: {}});
        should.exist(rendered);
        rendered.string.should.equal('#thatsthegoodstuff');

        rendered = helpers.url.call(
            {url: '#thatsthegoodstuff', label: 'Baz', slug: 'baz', current: true},
            {hash: {absolute: 'true'}});
        should.exist(rendered);
        rendered.string.should.equal('#thatsthegoodstuff');
    });

    it('should not HTML-escape URLs', function () {
        rendered = helpers.url.call(
            {url: '/foo?foo=bar&baz=qux', label: 'Foo', slug: 'foo', current: true});
        should.exist(rendered);
        rendered.string.should.equal('/foo?foo=bar&baz=qux');
    });

    it('should encode URLs', function () {
        rendered = helpers.url.call(
            {url: '/foo?foo=bar&baz=qux&<script>alert("gotcha")</script>', label: 'Foo', slug: 'foo', current: true});
        should.exist(rendered);
        rendered.string.should.equal('/foo?foo=bar&baz=qux&%3Cscript%3Ealert(%22gotcha%22)%3C/script%3E');
    });

    it('should not double-encode URLs', function () {
        rendered = helpers.url.call(
            {url: '/?foo=space%20bar', label: 'Foo', slug: 'foo', current: true});
        should.exist(rendered);
        rendered.string.should.equal('/?foo=space%20bar');
    });

    describe('with subdir', function () {
        it('external urls should be retained in a nav context with subdir', function () {
            configUtils.set({url: 'http://testurl.com/blog'});
            rendered = helpers.url.call(
                {url: 'http://casper.website/baz', label: 'Baz', slug: 'baz', current: true},
                {hash: {absolute: 'true'}});
            should.exist(rendered);
            rendered.string.should.equal('http://casper.website/baz');
        });

        it('should handle subdir being set in nav context', function () {
            configUtils.set({url: 'http://testurl.com/blog'});

            rendered = helpers.url.call(
                {url: '/xyzzy', label: 'xyzzy', slug: 'xyzzy', current: true},
                {hash: {absolute: 'true'}});
            should.exist(rendered);
            rendered.string.should.equal('http://testurl.com/blog/xyzzy');
        });
    });
});
