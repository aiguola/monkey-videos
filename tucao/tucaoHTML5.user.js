// ==UserScript==
// @name         tucaoHTML5
// @version      2.4
// @include      http://www.tucao.cc/play/*
// @description  Get video links in tucao.cc
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @license      GPLv3
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==


/**
 * base64 function wrap
 * usage: base64.encode(str); base64.decode(base64_str);
 */
var base64 = {
  encodeChars : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs' +
    'tuvwxyz0123456789+/',
  decodeChars : [
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
　　-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
　　52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
　　-1,　0,　1,　2,　3,  4,　5,　6,　7,　8,　9, 10, 11, 12, 13, 14,
　　15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
　　-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
　　41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],

  encodeFunction: function(str) {
  　　var out = '',
      len = str.length,
      i = 0,
      c1,
      c2,
      c3;
  
    while(i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if(i === len) {
        out += this.encodeChars.charAt(c1 >> 2);
        out += this.encodeChars.charAt((c1 & 0x3) << 4);
        out += "==";
        break;
      }
      c2 = str.charCodeAt(i++);
      if(i === len) {
        out += this.encodeChars.charAt(c1 >> 2);
        out += this.encodeChars.charAt(((c1 & 0x3)<< 4) | 
            ((c2 & 0xF0) >> 4));
        out += this.encodeChars.charAt((c2 & 0xF) << 2);
        out += "=";
        break;
      }
      c3 = str.charCodeAt(i++);
      out += this.encodeChars.charAt(c1 >> 2);
      out += this.encodeChars.charAt(((c1 & 0x3)<< 4) |
          ((c2 & 0xF0) >> 4));
      out += this.encodeChars.charAt(((c2 & 0xF) << 2) |
          ((c3 & 0xC0) >>6));
      out += this.encodeChars.charAt(c3 & 0x3F);
    }
    return out;
  },

  decodeFunction: function(str) {
    var c1,
      c2,
      c3,
      c4,
      len = str.length,
      out = '',
      i = 0;

    while(i < len) {
      do {
        c1 = this.decodeChars[str.charCodeAt(i++) & 0xff];
      } while(i < len && c1 === -1);
      if(c1 === -1) {
        break;
      }

      do {
        c2 = this.decodeChars[str.charCodeAt(i++) & 0xff];
      } while(i < len && c2 === -1);
      if(c2 === -1) {
        break;
      }
      out += String.fromCharCode((c1 << 2) |
          ((c2 & 0x30) >> 4));
      
      do { 
        c3 = str.charCodeAt(i++) & 0xff;
        if(c3 === 61) {
          return out;
        }
        c3 = this.decodeChars[c3];
      } while(i < len && c3 === -1);
      if(c3 === -1) {
        break;
      }
      out += String.fromCharCode(((c2 & 0XF) << 4) |
          ((c3 & 0x3C) >> 2));

      do { 
        c4 = str.charCodeAt(i++) & 0xff;
        if(c4 === 61) {
          return out;
        }
        c4 = this.decodeChars[c4];
      } while(i < len && c4 === -1);
      if(c4 === -1) {
        break;
      }
      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    };
    return out;
  },

  utf16to8: function(str) {
    var out = '',
      len = str.length,
      i,
      c;

    for(i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += str.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >>　6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >>　0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >>　6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >>　0) & 0x3F));
      }
    }
    return out;
  },

  utf8to16: function(str) {
  　　var out = '',
      len = str.length,
      i = 0,
      c,
      char2,
      char3;
  
    while(i < len) {
      c = str.charCodeAt(i++);
      switch(c >> 4) {
      // 0xxxxxxx
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += str.charAt(i - 1);
        break;
      // 110x xxxx　 10xx xxxx
      case 12: case 13:
        char2 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x1F) << 6) |
            (char2 & 0x3F));
        break;
      // 1110 xxxx　10xx xxxx　10xx xxxx
      case 14:
        char2 = str.charCodeAt(i++);
        char3 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
        break;
      }
    }
    return out;
  },

  // This is encode/decode wrap, which convert chars between UTF-8
  // and UTF-16;
  encode: function(str) {
    return this.encodeFunction(this.utf16to8(str));
  },

  decode: function(str) {
    return this.utf8to16(this.decodeFunction(str));
  },
};


/**
 * UI functions.
 * create UI which has multiples files per video.
 */
var multiFiles = {

  // videos is an object containing these fields:
  // title, video title
  // formats, title of each video format
  // links, list containing video links of each duration
  videos: null,

  run: function(videos) {
    console.log('multiFiles.run() --');
    this.videos = videos;
    if ((!videos.formats) || (videos.formats.length === 0)) {
      console.error('Error: no video formats specified!');
      return;
    }
    this.removeOldPanels();
    this.createPanel();
  },

  removeOldPanels: function() {
    console.log('removeOldPanels() --');
    var panels = document.querySelectorAll('.monkey-videos-panel'),
        panel,
        i;

    for (i = 0; panel = panels[i]; i += 1) {
      panel.parentElement.removeChild(panel);
    }
  },

  /**
   * Create the control panel.
   */
  createPanel: function() {
    console.log('createPanel() --');
    var panel = document.createElement('div'),
        div,
        form,
        label,
        input,
        span,
        a,
        i,
        playlistWrap,
        playlistToggle,
        that = this;

    this.addStyle([
      '.monkey-videos-panel {',
        'position: fixed;',
        'right: 10px;',
        'bottom: 0px;',
        'z-index: 99999;',
        'border: 2px solid #ccc;',
        'border-top-left-radius: 14px;',
        'margin: 10px 0px 0px 0px;',
        'padding: 10px 10px 0px 10px;',
        'background-color: #fff;',
        'overflow-y: hidden;',
        'max-height: 90%;',
        'min-width: 100px;',
        'text-align: left;',
      '}',
      '.monkey-videos-panel:hover {',
        'overflow-y: auto;',
      '}',
      '.monkey-videos-panel label {',
        'margin-right: 10px;',
      '}',
      '.monkey-videos-panel .playlist-item {',
        'display: block;',
        'margin-top: 8px;',
      '}',
      '.monkey-videos-panel #playlist-toggle {',
        'height: 10px;',
        'margin-top: 10px;',
      '}',
      '.monkey-videos-panel #playlist-toggle:hover {',
        'cursor: pointer;',
      '}',
      '.monkey-videos-panel .playlist-show {',
        'background-color: #8b82a2;',
        //'border-radius: 0px 0px 5px 5px;',
      '}',
      '.monkey-videos-panel .playlist-hide {',
        'background-color: #462093;',
        //'border-radius: 5px 5px 0px 0px;',
      '}',
    ].join(''));

    panel.className = 'monkey-videos-panel';
    document.body.appendChild(panel);

    playlistWrap = document.createElement('div');
    playlistWrap.className = 'playlist-wrap';
    panel.appendChild(playlistWrap);

    div = document.createElement('div');
    div.className = 'playlist-nav';
    playlistWrap.appendChild(div);

    form = document.createElement('form');
    form.className = 'playlist-format';
    playlistWrap.appendChild(form);
    for (i = 0; i < this.videos.formats.length; i += 1) {
      label = document.createElement('label');
      form.appendChild(label);
      input = document.createElement('input');
      label.appendChild(input);
      input.type = 'radio';
      input.name = 'monkey-videos-format';
      span = document.createElement('span');
      label.appendChild(span);
      span.innerHTML = this.videos.formats[i];

      (function(input, pos) {
        input.addEventListener('change', function() {
          that.modifyList(pos);
          GM_setValue('format', pos);
        }, false);
      })(input, i);
    }
    
    // playlist m3u (with url data schema)
    a = document.createElement('a');
    a.className = 'playlist-m3u';
    a.innerHTML = '播放列表';
    a.title = a.innerHTML;
    a.download = this.videos.title + '.m3u';
    a.href = '';
    form.appendChild(a);

    div = document.createElement('div');
    div.className = 'playlist';
    playlistWrap.appendChild(div);

    playlistToggle = document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = document.querySelector('.monkey-videos-panel .playlist-wrap');
      if (wrap.style.display === 'none') {
        wrap.style.display = 'block';
        event.target.className = 'playlist-show';
        event.target.title = '隐藏';
        GM_setValue('hidePlaylist', false);
      } else {
        wrap.style.display = 'none';
        event.target.title = '显示';
        event.target.className = 'playlist-hide';
        GM_setValue('hidePlaylist', true);
      }
    }, false);

    if (GM_getValue('hidePlaylist', false)) {
      playlistToggle.click();
    }

    this.loadDefault();
  },

  loadDefault: function() {
    console.log('loadDefault() --');
    // Load default type of playlist.
    var currPos = GM_getValue('format', 0),
        formats = this.videos.formats,
        currPlaylist;

    console.log('currPos: ', currPos);
    if (formats.length <= currPos) {
      currPos = formats.length - 1;
    }
    console.log('currPos: ', currPos);

    currPlaylist = document.querySelectorAll(
        '.monkey-videos-panel .playlist-format input')[currPos];

    if (currPlaylist) {
      currPlaylist.checked = true;
      this.modifyList(currPos);
    }
  },

  /**
   * Modify the playlist content.
   *
   * Empty playlist first, and add new links of specific video format.
   */
  modifyList: function(pos) {
    console.log('modifyList(), pos = ', pos);
    var playlist = document.querySelector('.monkey-videos-panel .playlist'),
        url,
        a,
        i;
    
    // Clear its content first
    playlist.innerHTML = '';

    for (i = 0; url = this.videos.links[pos][i]; i += 1) {
      a = document.createElement('a');
      playlist.appendChild(a);
      a.className = 'playlist-item',
      a.href = url;
      if (this.videos.links[pos].length == 1) {
        a.innerHTML = this.videos.title;
      }
      else if (i < 9) {
        a.innerHTML = this.videos.title + '(0' + String(i + 1) + ')';
      } else {
        a.innerHTML = this.videos.title + '(' + String(i + 1) + ')';
      }
      a.title = a.innerHTML;
    }

    // Refresh m3u playlist file.
    document.querySelector('.playlist-m3u').href = this.plsDataScheme();
  },

  /**
   * Generate Playlist using base64 and Data URI scheme.
   * So that we can download directly and same it as a pls file using HTML.
   * URL:http://en.wikipedia.org/wiki/Data_URI_scheme
   * @return string
   *  - Data scheme containting playlist.
   */
  plsDataScheme: function() {
    console.log('plsDataSchema() --');
    return 'data:audio/x-m3u;charset=UTF-8;base64,' +
      base64.encode(this.generatePls());
  },

  /**
   * Generate pls - a multimedia playlist file, like m3u.
   * @return string
   * - playlist content.
   */
  generatePls: function() {
    console.log('generatePls() --');
    var output = [],
        links = document.querySelectorAll('.monkey-videos-panel .playlist-item'),
        a,
        i;

    output.push('#EXTM3U');
    for (i = 0; a = links[i]; i += 1) {
      output.push('#EXTINF:81, ' + a.innerHTML);
      output.push(a.href);
    }
    return output.join('\n');
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    var style = document.createElement('style');
    if (document.head) {
      document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {

  url: '',
  title: '',
  playerId: '',
  key: '',
  timestamp: '',
  vid: '',
  type: '',
  vids: [],
  pos: 0,
  videos: [],
  format: '标清',
  redirect: false,
  types: {
    sina: 'sina',
    tudou: false,  // redirect to original url
    youku: false,  // redirect to original url
  },

  run: function() {
    console.log('run()');
    this.getVid();
  },

  /**
   * Get video id
   */
  getVid: function() {
    console.log('getVid() -- ');
    var playerCode = document.querySelectorAll(
          'ul#player_code li');

    if (playerCode && playerCode.length === 2) {
      this.vids = playerCode[0].firstChild.nodeValue.split('**');
      if (this.vids[this.vids.length - 1] == '') {
        // remove empty vid
        this.vids.pop();
      }
      this.playerId = playerCode[1].innerHTML;
      this.getTitle();
    }
  },

  /**
   * Get video title
   */
  getTitle: function() {
    console.log('getTitle()');
    var params;

    if (this.vids.length === 1 || location.hash === '') {
      this.pos = 0;
      this.url = location.href;
    } else {
      // hash starts with 1, not 0
      this.pos = parseInt(location.hash.replace('#', '')) - 1;
      this.url = location.href.replace(location.hash, '');
    }
    params = this.getQueryVariable(this.vids[this.pos].split('|')[0]);
    this.vid = params.vid;
    this.type = params.type;
    if (this.vids.length === 1) {
      this.title = document.title.substr(0, document.title.length - 16);
    } else {
      this.title = this.vids[this.pos].split('|')[1];
    }
    this.getUrl();
  },

  /**
   * Get original url
   */
  getUrl: function(type) {
    console.log('getUrl()');
    var url,
        params,
        that = this;

    if (this.types[this.type] === false) {
      this.redirectTo();
      return;
    }

    this.calcKey();
    url = [
      'http://www.tucao.cc/api/playurl.php',
      '?type=',
      this.type,
      '&vid=',
      this.vid,
      '&key=', this.key,
      '&r=', this.timestamp
      ].join('');

    console.log('url: ', url);
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function(response) {
        console.log(response);
        var xml = that.parseXML(response.responseText),
            durls = xml.querySelectorAll('durl'),
            durl,
            url,
            i;

        for (i = 0; durl = durls[i]; i += 1) {
          url = durl.querySelector('url'); 
          that.videos.push(
            url.innerHTML.replace('<![CDATA[', '').replace(']]>', ''));
        }

        that.createUI();
      },
    });
  },

  /**
   * 计算这个请求的授权key.
   * 算法来自于: http://www.cnbeining.com/2014/05/serious-businesstucao-cc-c-video-resolution/
   * @return [key, timestamp]
   */
  calcKey: function() {
    console.log('calcKey () --');
    var time = new Date().getTime(),
        this.timestamp = Math.round(time / 1000);

    var local3 = this.timestamp ^ 2774181285;
    var local4 = parseInt(this.vid, 10);
    var local5 = local3 + local4;
    local5 = (local5 < 0) ? (-(local5) >> 0) : (local5 >> 0);
    this.key = 'tucao' + local5.toString(16) + '.cc';
  },

  /**
   * Redirect to original url
   */
  redirectTo: function() {
    console.log('redirectTo() --');
    var urls = {
          tudou: function(vid) {
            return 'http://www.tudou.com/programs/view/' + vid + '/';
          },
          youku: function(vid) {
            return 'http://v.youku.com/v_show/id_' + vid + '.html';
          },
        };

    this.redirect = true;
    this.videos.push(urls[this.type](this.vid));
    this.formats.push('原始地址');
    this.createUI();
  },

  /**
   * Construct ui widgets
   */
  createUI: function() {
    console.log('createUI() -- ');
    console.log(this);
    var videos = {
          title: this.title,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    videos.links.push(this.videos);
    videos.formats.push(this.format);
    multiFiles.run(videos);
  },

  /**
   * Convert string to xml
   * @param string str
   *  - the string to be converted.
   * @return object xml
   *  - the converted xml object.
   */
  parseXML: function(str) {
    if (document.implementation && document.implementation.createDocument) {
      xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    } else {
      console.log('parseXML() error: not support current web browser!');
      return null;
    }
    return xmlDoc;
  },

  /**
   * Split query parameters in url and convert to object
   */
  getQueryVariable: function(query) {
    var vars = query.split('&'),
        params = {},
        param,
        i;

    for (i = 0; i < vars.length; i += 1) {
      param = vars[i].split('=');
      params[param[0]] = param[1];
    }
    return params;
  },
}

monkey.run();

