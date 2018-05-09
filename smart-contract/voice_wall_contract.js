"use strict";

var VoiceItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.nick = obj.nick;// nickname
		this.msg = obj.msg;// message
		this.time = obj.time;// leave time
		this.author = obj.author;// author
		this.like = obj.like;// like it
	} else {
	    this.nick = "";
	    this.msg = "";
	    this.time = "";
	    this.author = "";
	    this.like = "0";
	}
};

VoiceItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

//show data 
var PageVO = function (data, total) {
	this.data = data;
	this.total = total;
}

PageVO.prototype = {
		toString: function () {
			return JSON.stringify(this);
		}
};

var VoiceWall = function () {
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new VoiceItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

VoiceWall.prototype = {
    init: function () {
    	this.size = 0;
    },

    save: function (nick, msg, time) {
        nick = nick.trim();
        msg = msg.trim();
        if (msg === "") {
            throw new Error("empty msg");
        }
        if (nick.length > 32 || msg.length > 128) {
            throw new Error("nick / msg exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var key = time + "_" + from;// current key
        var voiceItem = new VoiceItem();
        voiceItem.author = from;
        voiceItem.nick = nick;
        voiceItem.msg = msg;
        voiceItem.time = time;
        voiceItem.like = "0";
        this.arrayMap.set(this.size, key); // 序列索引
        this.repo.put(key, voiceItem); // 数据存储
        this.size +=1;
    },
    
    like: function (key) {
    	 key = key.trim();
         if ( key === "" ) {
             throw new Error("empty key")
         }
         var item = this.repo.get(key);
         if (!item) {
        	 throw new Error("voice item not exist");
         }
         var like = parseInt(item.like) + 1;
         item.like = like.toString();
         this.repo.set(key, item);
    },
    
    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },
    
    forEach: function (limit, offset) {
    	limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset > this.size) {
           throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if(number > this.size){
          number = this.size;
        }
        var result = new Array();
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var obj = this.repo.get(key);
            result.push(obj);
        }
        var pageVO = new PageVO();
        pageVO.data = result;
        pageVO.total = this.size.toString();
        return pageVO;
    }
};
module.exports = VoiceWall;