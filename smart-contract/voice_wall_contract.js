"use strict";

var VoiceItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.nick = obj.nick;// 昵称
		this.msg = obj.msg;// 留下的信息
		this.date = obj.date;// 日期
		this.author = obj.author;// 留言人 
		this.like = obj.like;//后续加入点赞
	} else {
	    this.nick = "";
	    this.msg = "";
	    this.date = "";
	    this.author = "";
	    this.like = 0;
	}
};

VoiceItem.prototype = {
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

    save: function (nick, msg, date) {

        nick = nick.trim();
        msg = msg.trim();
        if (msg === "") {
            throw new Error("empty msg");
        }
        if (nick.length > 32 || msg.length > 128) {
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var key = date + from;// 暂用当前时间作为key
        var voiceItem = new VoiceItem();
        voiceItem.author = from;
        voiceItem.nick = nick;
        voiceItem.msg = msg;
        voiceItem.date = date
        voiceItem.like = 0;
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
         var like = item.like;
         item.like = like + 1;
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
        return JSON.stringify(result);
    },
    del: function (key) {
    	// TODO 暂不开放
    }
};
module.exports = VoiceWall;