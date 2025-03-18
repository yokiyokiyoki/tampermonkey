/**
 * @author donghyun seo
 * @desc 좌석 Utils
 * @external jQuery
 */
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (val) {
		return jQuery.inArray(val, this);
	};
}

var queryTime = new Date().getTime();

tk = (typeof tk !== "undefined") ? tk : {};
tk.utils = {
	/**
	 * @description 문자열로부터 네임스페이스를 생성하는 함수
	 * @param {String} sNamespace 네임스페이스 문자열 (예: tk.ComponentName)
	 * @return {Object}
	 */
	createNamespace: function (sNamespace) {
		var aSpace = sNamespace.split(".");
		var oParent = window;
		var sObjectName = null;
		for (var i = 0, len = aSpace.length; i < len; i++) {
			sObjectName = aSpace[i];
			if (i === (len - 1)) {
				break;
			}
			if (typeof oParent[sObjectName] !== "object") {
				oParent[sObjectName] = {};
			}
			oParent = oParent[sObjectName];
		}
		return {
			container: oParent,
			name: sObjectName
		};
	},

	/**
	 * @description 객체가 속성을 가지고 있는지 여부
	 * @param {Object} object 객체
	 * @param {String} property 확인할 속성
	 * @return {Boolean} 속성 존재 여부
	 */
	hasProperty: function (object, property) {
		if (!object) {
			return false;
		}

		return typeof (object) === 'object' && object.hasOwnProperty(property);
	},

	/**
	 * @description 싱글톤 객체 반환
	 * @param {Object} cons 실글톤할 객체
	 * @return {Object} 실글톤 객체
	 */
	singletonify: function (cons) {

		var INSTANCE;

		var c = function () {
			if (INSTANCE === undefined) {

				var F = function () {
				};
				F.prototype = cons.prototype;

				var t = new F();
				var ret = cons.apply(t, Array.prototype.slice.call(arguments));

				INSTANCE = (typeof ret === 'object') ? ret : t;
			}

			return INSTANCE;
		};

		c.getInstance = function () {
			return c.apply(null, Array.prototype.slice.call(arguments));
		};

		return c;
	},

	/**
	 * @description Promise all 반환
	 * @param {Array} promises 확인할 Promise 리스트
	 * @return {Object} Promise all
	 */
	getPromiseAll: function (promises) {
		if (!promises || !Array.isArray(promises)) {
			return null;
		}
		return $.when.apply($, promises);
	},

	/**
	 * @description 문자열에 해당 내용이 포함되어 있는지
	 * @param {String} search 확인할 문자열
	 * @param {Number} start 시작 위치
	 * @return {Boolean} 문자열 포함 여부
	 */
	includes: function (search, start) {
		if (typeof start !== 'number') {
			start = 0;
		}

		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	},

	/**
	 * @description Url 파싱
	 * @param {String} url 파싱할 url
	 * @return {Object} 파싱된 url
	 */
	parseUrl: function (url) {
		var options = {
			strictMode: false,
			key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
			q: {
				name: "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};

		var o = options,
			m = o.parser[o.strictMode ? "strict" : "loose"].exec(url),
			parsedUrl = {},
			i = 14;

		while (i--) parsedUrl[o.key[i]] = m[i] || "";

		parsedUrl[o.q.name] = {};
		parsedUrl[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) parsedUrl[o.q.name][$1] = $2;
		});

		return parsedUrl;
	},

	/**
	 * @description 팝업 종료
	 */
	windowClose: function () {
		window.close();
	},

	/**
	 * @description 배열 비었는지 여부
	 * @param {Array} array 확인할 배열
	 * @return {Boolean} 비었는지 여부
	 */
	isEmptyArray: function (array) {
		return Array.isArray(array) && array.length === 0
	},

	/**
	 * @description iOS 여부 반환
	 * @return {Boolean} iOS 여부
	 */
	isIOS: function () {
		return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
	},

	/**
	 * @description iOS 웹뷰 여부 반환
	 * @return {Boolean} iOS 웹뷰 여부
	 */
	isIOSMobileApp: function () {
		var standalone = window.navigator.standalone,
			userAgent = window.navigator.userAgent.toLowerCase(),
			safari = /safari/.test(userAgent),
			ios = /iphone|ipod|ipad/.test(userAgent);

		if (ios) {
			if (!standalone && safari) {
				return false;
			} else if (standalone && !safari) {
				return false;
			} else if (!standalone && !safari) {
				return true;
			}
		} else {
			return false;
		}
	},

	/**
	 * @description iOS 모바일웹 여부 반환
	 * @return {Boolean} iOS 모바일웹 여부
	 */
	isIOSMobileWebSafari: function () {
		var userAgent = window.navigator.userAgent.toLowerCase(),
			safari = /safari/.test(userAgent),
			mobile = /mobile/.test(userAgent);
		return this.isIOS() && !this.isIOSMobileApp() && safari && mobile;
	},

	/**
	 * @description AOS Samsung 여부 반환
	 * @return {Boolean} AOS Samsung 여부
	 */
	isAOSSamsungMobileApp: function () {
		var userAgent = window.navigator.userAgent.toLowerCase();
		var isApp = /ticketlink/.test(userAgent);
		var isAOS = /android/.test(userAgent);
		var isSamsung = /sm-/.test(userAgent);
		return isAOS && isSamsung;
	},

	/**
	 * @description AOS LG 여부 반환
	 * @return {Boolean} AOS LG 여부
	 */
	isAOSLGMobileApp: function () {
		var userAgent = window.navigator.userAgent.toLowerCase();
		var isAOS = /android/.test(userAgent);
		var isLG = /lg-|lgm-|lm-/.test(userAgent);
		return isAOS && isLG;
	},

	/**
	 * @description 입력된 값의 법위에 해당하는 리스트를 반환
	 * @param {Number} min 최소 값
	 * @param {Number} max 최대 값
	 * @param {Number} step 증가 크기
	 * @return {Array} 입력된 값의 법위에 해당하는 리스트
	 */
	range: function (min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	},

	/**
	 * @description 입력한 포맷과 파라미터에 따라 문자열을 치환
	 *                parameter 1  : 치환될 문자열 포맷
	 *                parameter 2~ : 치환할 문자들
	 * @return {String} 치환된 문자열
	 */
	format: function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] !== 'undefined'
				? args[number]
				: match
				;
		});
	},

	/**
	 * @description 문자열 좌측 공백처리
	 * @param {Object} str 공백을 넣을 값
	 * @param {String} fillChar 공백에 채울 문자열
	 * @param {Number} length 문자열 크기
	 * @return {String} 좌측 공백 개수
	 */
	leftPad: function (str, fillChar, length) {
		str = String(str);

		if (fillChar.length !== 1) {
			return ""; // fillChar must be a single character
		}

		if (str.length > length)
			return str;

		var returnStr = "";
		var i;
		for (i = str.length; i < length; i++) {
			returnStr = returnStr + fillChar;
		}

		returnStr = returnStr + str;

		return returnStr;
	},

	/**
	 * @description 문자열에 시간 쿼리 추가
	 * @param {String} str 시간 쿼리 추가할 문자열
	 * @return {String} 시간 쿼리 추가된 문자열
	 */
	addQueryTime: function (str) {
		return str + "?" + queryTime;
	},

	/**
	 * @description 0보다 큰 수 반환
	 * @param {Number} num 환인할 값
	 * @return {Number} 0보다 큰 수
	 */
	getNumberOverZero: function (num) {
		if (isNaN(num)) {
			return 0;
		}

		return Math.max(parseInt(num, 10), 0);
	},

	/**
	 * @description url에서 글로벌 여부 확인
	 * @return {Boolean} 글로벌 여부
	 */
	isLocaleGlobal: function () {
		var globalUrlPattern = /global\/[a-z]{2}\//;
		return globalUrlPattern.test(location.href);
	},

	/**
	 * @description 예매대기인지 확인하는 함수
	 * @return {Boolean} 예매대기 여부
	 */
	isWaitingReservation: function () {
		if (tk.state.global.meta.frontPlanTypeCode) {
			return tk.state.global.meta.frontPlanTypeCode !== 'NONE';
		}
		return false;
	},

	/**
	 * @description 예매대기인지 페이지 이동 함수
	 * @return {Boolean} 예매대기 여부
	 */
	moveReservationWaitingPage: function () {
		if (tk.state.plan.schedule.scheduleId) {
			var domain = 'https://' + location.hostname;
			location.href = domain + '/reserve/waiting/schedule/' + tk.state.plan.schedule.scheduleId;
		}
	},

	/**
	 * @description 예매대기판매 전 알럿
	 */
	showNotSaleReservationWaiting: function () {
		if (tk.state.plan.scheduleWaitingReservation) {
			if (tk.state.plan.scheduleWaitingReservation.hasOwnProperty('saleStatus')) {
				if (tk.state.plan.scheduleWaitingReservation.saleStatus === WAITING_SALE_STATUS['BEFORE']) {
					alert('해당 회차는 ' + tk.state.plan.scheduleWaitingReservation.parsedSaleStartDate + '부터 취소표대기 신청이 가능합니다.');
				}
			}
		}
	},


	/**
	 * @description 오류 알림
	 * @param {Object} q Api 로 받은 데이터
	 */
	errorNotice: function (q) {
		if (q.hasOwnProperty('result') && this.hasErrorCode(q.result)) {
			if (q.result.hasOwnProperty('message')) {
				var message = q.result.message.split(",");
				if (tk.i18n.translate.getTranslate(message[0])) {
					alert(tk.i18n.translate.getTranslate(message[0], message[1]));
				} else {
					alert(q.result.message)
				}
			} else if (q.hasOwnProperty('data')) {
				alert(q.data);
			} else {
				alert(tk.i18n.translate.getTranslate("PLEASE_CONTACT_SERVICE_CENTER"));
			}
			return;
		}

		if (q.hasOwnProperty("errorInfo")) {
			alert(q.errorInfo);
			return;
		}
	},

	/**
	 * @description 오류 코드를 가졌는지 여부 반환
	 * @param {Object} q Api 로 받은 데이터
	 * @return {Boolean} 오류 코드를 가졌는지 여부
	 */
	hasErrorCode: function (q) {
		return q.hasOwnProperty('code') && q.code !== 0;
	},

	/**
	 * @description moment Date반환
	 * @param {Object} q Api 로 받은 데이터
	 * @return {Boolean} 오류 코드를 가졌는지 여부
	 */
	momentFormat: function (date, format) {
		if (!format) {
			format = 'YYYY[.]MM[.]DD HH:mm';
		}
		return moment.tz(date, "Asia/Seoul").format(format);
	}
};


/**
 * @author donghyun seo
 * @desc 각종 예외들
 * @external tk.utils
 */

tk.utils.createNamespace("tk.exceptions");
tk.exceptions = (function () {
	'use strict';

	var scope = {};

	scope.CanvasNotSupportException = CanvasNotSupportException;
	scope.ApiNotReadyException = ApiNotReadyException;
	scope.AjaxCallException = AjaxCallException;
	scope.IllegalArgumentException = IllegalArgumentException;

	/**
	 * @description 캔버스 미지원 예외
	 * @param {String} message 예외 메시지
	 */
	function CanvasNotSupportException (message) {
		this.name = 'CanvasNotSupportException';
		this.message = message || 'Can not support canvas';
	}

	/**
	 * @description Api 미준비 예외
	 * @param {String} message 예외 메시지
	 */
	function ApiNotReadyException (message) {
		this.name = 'ApiNotReadyException';
		this.message = message || 'Api not ready';
	}

	/**
	 * @description Ajax Call 예외
	 * @param {String} message 예외 메시지
	 */
	function AjaxCallException (message) {
		this.name = 'AjaxCallException';
		this.message = 'Ajax call : ' + (message || 'error');
	}

	/**
	 * @description 잘못된 파라미터 예외
	 * @param {String} message 예외 메시지
	 */
	function IllegalArgumentException (message) {
		this.name = 'IllegalArgumentException';
		this.message = message || 'Enter illegal argument';
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc i18n 한국어 관련
 * @external tk.utils
 */

tk.utils.createNamespace("tk.i18n.ko");
tk.i18n.ko = (function () {
  "use strict";

  return {
    WEEK: ["일", "월", "화", "수", "목", "금", "토"],

    SEAT: "석",
    COUNT: "매",
    SEATS: "석",
    N_SEATS: "{0}매",
    QTY: "매",
    N_QTY: "{0}매",
    KRW: "원",

    AVAILABLE_SEATS: "등급 선택",
    SEAT_TYPE: "등급 선택",
    TOTAL: "전체",
    RESET1: "새로고침",
    RESET2: "초기화",
    RESET3: "좌석선태 초기화 및 도면 새로고침",
    RELOAD: "초기화",
    SELECTED_SEATS: "선택된 좌석",
    QTY_SELECT: "매수선택",
    QTY_SELECTED: "매수선택",
    SEATS_SELECT: "매수선택",
    LAYER_CLOSE: "레이어 닫기",
    DECREASE_COUNT: "매수 감소",
    INCREASE_COUNT: "매수 증가",
    OK_1: "변경",
    OK_2: "확인",
    NEXT: "다음단계",
    PREVIOUS: "이전단계",
    NOW_LOADING: "로딩중",
    NOTICE_ON_PREOCCUPANCY: "예매안내",
    SEAT_SELECT: "좌석 선택",
    NOTICE_ON_SEAT_PREOCCUPANCY: "좌석선점 및 자동배정 안내",
    NOTICE_ON_SEAT_PREOCCUPANCY_BODY: "내용 없음", // 한국어 페이지에서는 사용하지 않는다.
    STAGE_DIRECTION: "경기장/무대 방향",
    VIEW_ALL: "공연장 전체보기",
    ZOOM_IN: "확대보기",
    ZOOM_OUT: "축소보기",
    SOLD_OUT: "매진",
    TOOLTIP_VIEW_ALL: "좌석도 뒤로가기(전체보기)",
    TOOLTIP_ZOOM_IN: "확대",
    TOOLTIP_ZOOM_OUT: "축소",
    TOOLTIP_REFRESH: "좌석도 새로고침",

    PLEASE_SELECT_SEAT: "좌석을 선택해 주세요.",
    PLEASE_SELECT_QTY: "매수를 선택해주세요.",
    PLEASE_CONTACT_SERVICE_CENTER: "관리자에게 문의하세요.",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_1:
      "함께 예매할 수 없는 등급이 선택되어 있습니다.\n선택된 좌석을 해제 후 다시 진행 해 주세요.",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_2:
      "함께 예매할 수 없는 등급입니다.\n선택된 좌석을 해제 후 다시 진행 해 주세요.",
    PURCHASE_TOTAL_MAXIMUM_N_TICKET: "예매 당 최대 {0}매까지 구매 가능합니다.",
    PURCHASE_GRADE_MAXIMUM_N_TICKET:
      "해당 등급은 예매 당 최대 {0}매까지 구매 가능합니다.",
    THIS_IS_NOT_FOR_SALE: "미판매 영역입니다.",
    THERE_IS_NO_SEAT_AVAILABLE_FOR_PURCHASE:
      "선택하신 구역은 구매 가능한 등급이 없습니다.",
    THERE_IS_NO_SEAT_AVAILABLE_ON_PRESALE_PERIOD:
      "선예매 기간에 구매 가능한 좌석이 없습니다.",
    THERE_IS_NO_SEAT_AVAILABLE: "구매 가능한 좌석이 없습니다.",
    PLEASE_SELECT_SEAT_OF_SAME_GRADE_AS_SELECTED_GRADE:
      "선택한 등급과 동일한 등급의 좌석을 선택해 주세요.",
    THIS_SEAT_TYPE_CAN_NOT_BE_PURCHASED_NOW:
      "해당 등급은 선예매 기간에 예매가 불가능합니다.",

    SELECTED_SEAT_INFO_SELECT_GRADE:
      "등급을 먼저 선택 후, 좌석선택 유형을 선택해 주세요.",
    SELECTED_SEAT_INFO_SELECT_AUTO:
      "자동배정으로 예매 진행이 가능합니다. 등급 및 매수 선택 후 다음 단계를 선택해 주세요.",
    SELECTED_SEAT_INFO_SELECT_DIRECT:
      "직접선택으로 예매 진행이 가능합니다. 좌석을 선택해 주세요.",

    SELECTED_TYPE: "좌석등급 선택",
    SELECTED_TYPE_AUTO: "매수선택",
    SELECTED_TYPE_DIRECT: "직접선택",
    SELECTED_TYPE_INFO_AUTO:
      " : 선택된 영역과 상관없이 등급 내 연속된 좌석 선택",
    SELECTED_TYPE_INFO_DIRECT: " : 선택된 영역의 좌석 선택",

    /* 20181107 추가 */
    /*	############# 다국어처리 프로퍼티 생성*/

    /*	## 공통메세지*/
    "common.prev": "이전단계",
    "common.next": "다음단계",
    "common.currency": "원",
    "common.close": "닫기",
    "common.name": "이름",
    "common.birthday": "생년월일",
    "common.phoneNumber": "연락처",

    "common.ticket.count": "매",

    /*## 날짜/회차 선택 화면*/
    "schedule.title": "날짜/회차 선택",
    "schedule.date.select": "날짜선택",
    "schedule.date.select.sun": "일",
    "schedule.date.select.mon": "월",
    "schedule.date.select.tue": "화",
    "schedule.date.select.wed": "수",
    "schedule.date.select.thu": "목",
    "schedule.date.select.fri": "금",
    "schedule.date.select.sat": "토",
    "schedule.round.select": "회차선택",
    "schedule.round.select.alert": "관람일을 선택해주세요.",
    "schedule.seats.left.info": "잔여석",
    "schedule.select.alert": "회차 선택 후 확인 가능합니다.",

    "reserve.seat.short": "예매좌석",

    /*## 등급좌석 선택 화면*/
    "plan.title": "등급/좌석 선택",
    "plan.product.name": "상품명",
    "plan.vs.info": "대진정보",
    "plan.match.title": "매치타이틀",
    "plan.place.info": "장소정보",
    "plan.hall.info": "장소(관, 홀)정보",

    "plan.grade.select": "등급선택",
    "plan.grade.currency": "원",
    "plan.grade.seat": "석",

    "plan.seat.auto": "자동배정",
    "plan.seat.self": "직접선택",
    "plan.back": "뒤로가기",
    "plan.roundChange": "회차변경",
    "plan.stadiumStage.direction": "경기장/무대 방향",
    "plan.seat.selected": "선택된 좌석",
    "plan.seat.type": "좌석선택유형",
    "plan.seat.type.short": "등급선택",
    "plan.seat.auto.info": "자동배정",
    "plan.seat.auto.info.body":
      " : 선택된 영역과 상관없이 등급 내 연속된 좌석 선택",
    "plan.seat.self.info": "직접선택",
    "plan.seat.self.info.body": " : 선택된 영역의 좌석 선택",
    "plan.seat.auto.ticket.count": "매수선택",
    "plan.seat.auto.selected.info":
      "구매할 티켓의 총 매수를 선택 후 [다음단계] 버튼을 클릭해 주세요.",
    "plan.seat.soldout": "매진",
    "plan.seat.cancel": "닫기",
    "plan.seat.next": "다음단계",
    "plan.seat.select.quantity": "매수선택",
    "plan.seat.reset": "초기화",
    "plan.seat.change": "변경",
    "plan.seat.ok": "확인",
    "plan.channel.purchase": "구매 불가능한 채널입니다.",

		"plan.seat.api.error": "좌석 정보를 불러오는데 실패했습니다.\n정보를 다시 불러옵니다.",

    /*## 권종/매수 선택*/
    "denomination.title": "권종/매수 선택",
    "denomination.top.alert": "선택하신 좌석이 고객님께 선점되었습니다.",
    "denomination.top.alert2":
      "이내 결제하지 않으실 경우 선점된 좌석이 해제됩니다.",
    "denomination.selected.seat": "선택좌석",
    "denomination.ticket.count": "매수",
    "denomination.addOn.items": "부가상품 선택",
    "denomination.addOn.items.info":
      "선택하신 상품은 아래 부가상품을 함께 구매하실 수 있습니다.",
    "denomination.total.price": "총 결제금액",
    "denomination.booking.fee": "예매 수수료 포함",
    "denomination.won": "원",
    "denomination.grade.select.alert":
      "권종을 선택하세요. 최대 까지 예매가능합니다.",

    /*## 배송 선택/ 예매확인*/
    "delivery.title": "배송 선택/ 예매확인",
    "delivery.delivery.selected": "배송선택",
    "delivery.pickup.venue": "현장수령",
    "delivery.reserver.title": "주문자 확인",
    "delivery.reserver.required.field": "필수입력",
    "delivery.reserver.name": "이름",
    "delivery.reserver.birthday": "생년월일",
    "delivery.reserver.phonenumber": "휴대폰번호",
    "delivery.reserver.email": "이메일 주소",
    "delivery.reserver.confirm":
      "주문자 확인 및 예매처리를 위해 휴대폰번호 및 이메일을 수집하여, 이용목적 달성 이후 파기합니다.",
    "delivery.reserve.info.title": "예매정보",
    "delivery.reserve.ticket": "상품명",
    "delivery.reserve.place": "장소",
    "delivery.reserve.product": "상품명",
    "delivery.reserve.product.date": "일시",
    "delivery.reserve.selected.seat": "선택좌석",
    "delivery.payment.info.title": "결제정보",
    "delivery.payment.ticket.price": "티켓금액",
    "delivery.payment.commission.price": "예매수수료",
    "delivery.payment.additional.product": "부가상품",
    "delivery.payment.total.amount": "총결제",
    "delivery.payment.cancel.period": "취소기한",
    "delivery.payment.cancel.fee.info": "취소일자 별 수수료 안내",
    "delivery.payment.cancel.commission": "취소수수료",
    "delivery.payment.cancel.commission.info": "티켓금액의 0~30%",
    "delivery.payment.cancel.date": "취소일",
    "delivery.payment.cancel.fee.none": "취소수수료 미부과",
    "delivery.standard.schedule":
      "모든 스케줄은 현지 시간 및 날짜를 기준으로 합니다. (KST, GMT +9:00)",
    "delivery.personal.info.title": "개인정보 제3자 정보제공",
    "delivery.personal.info.content.head.first":
      "엔에이치엔링크㈜가 제공하는 상품 및 서비스를 구매하고자 할 경우, NHN LINK는 고객응대 및 상품정보 안내 등을 위하여 필요한 최소한의 개인정보만을 아래와 같이 제공하고 있습니다.",
    "delivery.personal.info.content.head.second":
      "NHN LINK는 정보통신망 이용촉진 및 정보보호 등에 관한 법률에 따라 아래와 같이 개인정보 제공에 대한 사항을 안내 드리오니 자세히 읽은 후 동의하여 주시기 바랍니다.",
    "delivery.personal.info.content.body.first": "1. 개인정보를 제공받는 자",
    "delivery.personal.info.content.body.second": "2. 제공하는 개인정보 항목",
    "delivery.personal.info.content.body.second.detail":
      ": 이름, 생년월일, 아이디, 휴대폰번호, (제공 시)이메일 주소, (배송 시)주문/배송정보",
    "delivery.personal.info.content.body.third":
      "3. 개인정보를 제공받는 자의 이용목적",
    "delivery.personal.info.content.body.third.detail":
      ": 티켓현장발권, 예매서비스 제공에 따른 내역 관리이행 등 티켓 예매 대행, 민원처리 등 고객상담, 서비스 분석과 통계에 따른 혜택 및 맞춤 서비스 제공, 서비스 이용에 따른 설문조사 및 혜택제공",
    "delivery.personal.info.content.body.fourth":
      "4. 개인정보를 제공받는 자의 개인정보 보유 및 이용기간",
    "delivery.personal.info.content.body.fourth.detail":
      ": 회원탈퇴 시 또는 개인정보 이용목적 달성 시까지. 단, 관계법령의 규정에 의해 보존의 필요가 있는 경우 및 사전 동의를 득한 경우 해당 보유기간까지",
    "delivery.personal.info.content.body.fifth": "5. 동의 거부권에 관한 공지",
    "delivery.personal.info.content.body.fifth.detail":
      "본 개인정보 제공에 동의하지 않으시는 경우, 동의를 거부할 수 있으며, 이 경우 상품구매가 제한될 수 있습니다.",
    "delivery.personal.agree.first":
      "위 취소정보를 확인했으며 이에 동의합니다.",
    "delivery.personal.agree.second":
      "개인정보 제 3자 제공에 동의합니다. (고객응대 및 관람정보안내 등을 위함)",
    "delivery.personal.agree.kbo": "kBO리그 SAFE 캠페인 동의합니다.",
    "delivery.payment": "결제하기",
    "delivery.additional.info": "부가정보",
    "delivery.payment.delivery.price": "배송료",
    "delivery.payment.discount.price": "할인",
    "delivery.payment.use.point": "사용 포인트",
    "delivery.payment.total.payment": "총 결제금액",
    "delivery.payment.info.confirm": "결제정보 확인",

    /*## 배송 선택/ 예매확인*/
    "booking.complete": "예매완료",
    "booking.info": "예매정보",
    "booking.date": "일시",
    "booking.number": "예매번호",
    "booking.user": "예매자",
    "booking.birthday": "생년월일",
    "booking.delivery": "티켓수령방법",
    "booking.ticket.price": "티켓금액",
    "booking.detail": "예매내역 확인",
    "booking.cancel.policy": "티켓취소 유의사항",
    "booking.cancel.policy.info.first":
      "예매수수료는 예매일 이후 취소 시에는 환불되지 않습니다. 취소기한 및 취소수수료를 반드시 확인해주세요.",
    "booking.cancel.policy.info.second":
      "신용카드 결제를 취소하는 경우, 취소 시 부과된 취소 수수료를 예매 시 사용한 것과 동일한 카드로 재결제가 이루어집니다. 따라서 무이자 할부를 포함한 프로모션 및 혜택은 적용되지 않습니다.",
    "booking.cancel.policy.info.third":
      "티켓 분실 또는 파손된 경우 취소 및 변경을 할 수 없습니다.",
    "booking.cancel.policy.info.fourth":
      "공연기획사/구단 자체로 인해 발생한 문제로 인해 환불을 받을 경우 추가 취소 수수료가 부과되지 않으며, NHN 티켓 링크가 아닌 공연기획사/구단 운영자가 환불할 수 있습니다.",

    /* 얼럿 */
    "alert.product.max.count.per.person.exceed":
      "구매가능매수를 초과 선택했습니다. 해당 상품의 예매 가능한 잔여 매수는 {0}매입니다.",
    "alert.product.max.count.per.inning.exceed":
      "구매가능매수를 초과 선택했습니다. 해당 회차의 예매 가능한 잔여 매수는 {0}매입니다.",
    "alert.product.max.buy.count.per.inning.exceed":
      "경기 혹은 공연회차당 예매가능한 횟수를 초과했습니다. 해당 상품은 {0}회까지 예매 가능합니다. ",
    "alert.grade.max.count.per.inning.exceed":
      "구매가능매수를 초과 선택했습니다. 해당 등급의 예매 가능한 잔여매수는 {0}매입니다.",

    "alert.denom.max.count.per.person.exceed":
      "권종의 인당 최대 구매 매수 초과입니다.",
    "alert.denom.max.count.per.inning.exceed":
      "권종의 회차당 최대 구매 매수 초과입니다.",
    "alert.denom.max.buy.count.per.inning.exceed":
      "권종의 회차당 구매 횟수 초과입니다.",

    "alert.denom.max.schedule.sale.purchase.exceed":
      "회차당 판매가능 매수 초과 입니다.",
    "alert.denom.max.product.sale.purchase.exceed":
      "상품당 판매가능 매수 초과 입니다.",

    "alert.denomination.count.exceed":
      "권종 잔여 매수를 초과하였습니다 다시 확인해 주세요. : {0}",

    "alert.additionalproduct.count.exceed":
      "부가상품 잔여 매수를 초과하였습니다 다시 확인해 주세요.",
    "alert.additionalproduct.max.count.exceed":
      "{0}은 1인당 최대 {1}개 구매 가능하며, 한 회차당 {2}개씩 구매할 수 있습니다. 상품 개수를 다시 선택해 주세요.",

    "alert.already.preoccupancy": "이미 선점된 좌석입니다.",
    "alert.zone.count.exceed": "잔여 매수를 확인해주세요.",
    "alert.exhibition.count.exceed": "잔여 매수를 확인해주세요.",

    "alert.fail.auto.reserved":
      "지정석 자동선점으로 구매 가능한 매수가 부족합니다.\n구매 매수를 조정하시거나, [닫기] 버튼 클릭 후 [직접선택]을 이용해 주세요.",
    "alert.fail.auto.non.reserved":
      "비지정석 자동선점으로 구매 가능한 매수가 부족합니다.",

    "alert.seatzone.deatseat.leftorright":
      "좌(우)측에 사석이 발생하여 좌석선택이 완료되지 않았습니다.",
    "alert.seatzone.deatseat.seat.together":
      "연석 좌석에 사석이 발생하여 좌석 선택이 완료되지 않았습니다.",
  };
})();

/**
 * @author donghyun seo
 * @desc i18n 영어 관련
 * @external tk.utils
 */

tk.utils.createNamespace("tk.i18n.en");
tk.i18n.en = (function () {
  "use strict";

  return {
    WEEK: ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"],

    SEAT: "Seat",
    COUNT: "Count",
    SEATS: "Seat(s)",
    N_SEATS: "{0} Seat(s)",
    QTY: "QTY",
    N_QTY: "{0}QTY",
    KRW: "KRW",

    AVAILABLE_SEATS: "Available seats",
    SEAT_TYPE: "Seat type",
    TOTAL: "Total",
    RESET1: "Reset",
    RESET2: "Reset",
    RESET3: "Reset",
    RELOAD: "Reload",
    SELECTED_SEATS: "Selected seat(s)",
    QTY_SELECT: "QTY",
    QTY_SELECTED: "Select quantity",
    SEATS_SELECT: "Seat(s)",
    LAYER_CLOSE: "Close",
    DECREASE_COUNT: "Decrease count",
    INCREASE_COUNT: "Increase count",
    OK_1: "OK",
    OK_2: "OK",
    NEXT: "Next",
    PREVIOUS: "Previous",
    NOW_LOADING: "Now loading",
    NOTICE_ON_PREOCCUPANCY: "Notice on seat type",
    SEAT_SELECT: "Selection type",
    NOTICE_ON_SEAT_PREOCCUPANCY: "Notice on seat preoccupancy",
    NOTICE_ON_SEAT_PREOCCUPANCY_BODY:
      "If you and another customer selects identical seat simultaneously at this stage, the one who proceeds" +
      " to the next step faster will occupy the seat. Thus, whether you had occupied the seat or not will be decided at the time when you proceed" +
      " to the next step after the seat selection.The payment must be completed within 8 minutes upon moving to the next step once you have" +
      " selected seating. If you fail to complete your payment within 5 minutes, the selected seat will be initialized for the convenience" +
      " of other customers.",
    STAGE_DIRECTION: "Stadium/Stage direction",
    VIEW_ALL: "View all",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    SOLD_OUT: "Sold out",
    TOOLTIP_VIEW_ALL: "Back(Reset)",
    TOOLTIP_ZOOM_IN: "Zoom in",
    TOOLTIP_ZOOM_OUT: "Zoom out",
    TOOLTIP_REFRESH: "Refresh",

    PLEASE_SELECT_SEAT: "Please select seat(s).",
    PLEASE_SELECT_QTY: "Please select quantity.",
    PLEASE_CONTACT_SERVICE_CENTER: "Please contact service center.",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_1:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_2:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    PURCHASE_TOTAL_MAXIMUM_N_TICKET:
      "You can purchase maximum {0} ticket(s) at once",
    PURCHASE_GRADE_MAXIMUM_N_TICKET:
      "This seat type can purchase maximum {0} ticket(s) at once.",
    THIS_IS_NOT_FOR_SALE: "This is not for sale.",
    THERE_IS_NO_SEAT_AVAILABLE: "There is no seat to purchase.",
    THERE_IS_NO_SEAT_AVAILABLE_FOR_PURCHASE:
      "There is no seat available for purchase.",
    THERE_IS_NO_SEAT_AVAILABLE_ON_PRESALE_PERIOD:
      "There is no seat to purchase at pre-sale.",
    PLEASE_SELECT_SEAT_OF_SAME_GRADE_AS_SELECTED_GRADE:
      "Please select a seat of the same grade as the selected grade.",
    THIS_SEAT_TYPE_CAN_NOT_BE_PURCHASED_NOW:
      "This seat type can not be purchased now.",

    CLEAN_RESERVATION_TITLE: "Clean Ticketing service",
    CLEAN_RESERVATION_DESCRIPTION:
      "To prevent fraudulent reservations, you can make reservations after entering the security text message.",
    CAPTCHA_AUTH_FAIL_MESSAGE: "Please enter it exactly.",
    RESELECT_DATE: "Reselect Date",

    SELECTED_SEAT_INFO_SELECT_GRADE:
      "Select a seat type, and then a seating selection type",
    SELECTED_SEAT_INFO_SELECT_AUTO: "Select a seat type and number of tickets.",
    SELECTED_SEAT_INFO_SELECT_DIRECT: "Select your seat",

    SELECTED_TYPE: "Select a seat type (seat category)",
    SELECTED_TYPE_AUTO: "Select quantity",
    SELECTED_TYPE_DIRECT: "Seat selection",
    SELECTED_TYPE_DIRECT1: "Seat",
    SELECTED_TYPE_DIRECT2: "selection",

    SELECTED_TYPE_INFO_AUTO:
      " : Adjacent seats will be randomly assigned within your chosen seat type (Regardless of the selected area)",
    SELECTED_TYPE_INFO_DIRECT: " : select your seat within your chosen section",

    /* 20181107 추가 */
    /*	############# 다국어처리 프로퍼티 생성*/

    /*## 공통메세지*/
    "common.prev": "Previous",
    "common.next": "Next",
    "common.currency": "KRW",
    "common.close": "close",
    "common.name": "Name",
    "common.birthday": "Date of birth",
    "common.phoneNumber": "Cell phone number",
    "common.ticket.count": "count",

    /*## 날짜/회차 선택 화면*/
    "schedule.title": "Select date/time",
    "schedule.date.select": "Select date",
    "schedule.date.select.sun": "SUN",
    "schedule.date.select.mon": "MON",
    "schedule.date.select.tue": "TUE",
    "schedule.date.select.wed": "WED",
    "schedule.date.select.thu": "THU",
    "schedule.date.select.fri": "FRI",
    "schedule.date.select.sat": "SAT",
    "schedule.round.select": "Select time",
    "schedule.round.select.alert": "Please select Date you want.",
    "schedule.seats.left.info": "Available seats",
    "schedule.select.alert": "After the time of selection can be confirmed.",

    "reserve.seat.short": "예매좌석",

    /*## 등급좌석 선택 화면*/
    "plan.title": "Seats",
    "plan.product.name": "상품명",
    "plan.vs.info": "대진정보",
    "plan.match.title": "매치타이틀",
    "plan.place.info": "장소정보",
    "plan.hall.info": "장소(관, 홀)정보",

    "plan.grade.select": "Seat type",

    "plan.grade.currency": "KRW",
    "plan.grade.seat": "seat(s)",

    "plan.seat.auto": "Auto assignment",
    "plan.seat.self": "Seat selection",
    "plan.back": "Back",
    "plan.roundChange": "Round Change",
    "plan.stadiumStage.direction": "Stadium/Stage direction",
    "plan.seat.selected": "Selected seats",
    "plan.seat.type": "Select a seating selection type",
    "plan.seat.type.short": "Seat type",
    "plan.seat.auto.info": "Auto assignment",
    "plan.seat.auto.info.body":
      " : Adjacent seats will be randomly assigned within your chosen seat type (Regardless of the selected area)",
    "plan.seat.self.info": "Seat selection",
    "plan.seat.self.info.body":
      " : select your seat within your chosen section",
    "plan.seat.auto.ticket.count": "Select quantity",
    "plan.seat.auto.selected.info":
      "Select number of tickets, and then [Next] button.",
    "plan.seat.soldout": "Sold out",
    "plan.seat.cancel": "Cancel",
    "plan.seat.next": "Next",
    "plan.seat.select.quantity": "Select quantity",
    "plan.seat.reset": "Reset",
    "plan.seat.change": "Change",
    "plan.seat.ok": "OK",
    "plan.channel.purchase": "This sales channel can not be purchased.",

    "plan.seat.api.error":
      "Failed to load seat information.\nReload information.",

    /*	## 권종/매수 선택*/
    "denomination.title": "Price/Discount",
    "denomination.top.alert":
      "You have successfully occupied the selected seat.",
    "denomination.top.alert2":
      "You will complete the reservation if you pay within",
    "denomination.selected.seat": "Selected seat",
    "denomination.ticket.count": "seat(s)",
    "denomination.addOn.items": "Add-on Items",
    "denomination.addOn.items.info":
      "You may purchase below add-on items for the selected product.",
    "denomination.total.price": "Total Amount",
    "denomination.booking.fee": "Including Booking Fee",
    "denomination.won": "KRW",
    "denomination.grade.select.alert":
      "권종을 선택하세요. 최대 {0}매 까지 예매가능합니다.",

    /*## 배송 선택/ 예매확인*/
    "delivery.title": "Delivery/Confirmation",
    "delivery.delivery.selected": "Delivery",
    "delivery.pickup.venue": "Pick-up at venue",
    "delivery.reserver.title": "Confirmation",
    "delivery.reserver.required.field": "is a required field.",
    "delivery.reserver.name": "Name",
    "delivery.reserver.birthday": "Date of birth",
    "delivery.reserver.phonenumber": "Cell phone number",
    "delivery.reserver.email": "E-Mail Address",
    "delivery.reserver.confirm":
      "Name, birthday, phone number and email information are collected for providing discount to the booker and\
		 processing reservation, and the collected information will be destroyed once the purpose of use is fulfilled. You may receive the SMS \
		on reservation only if your mobile phone number is the local number (number used in Korea) and if you do not provide your\
		phone number, you will receive the notification only via email.",
    "delivery.reserve.info.title": "Order Details",
    "delivery.reserve.ticket": "Ticket",
    "delivery.reserve.place": "Venue",
    "delivery.reserve.product": "Ticket",
    "delivery.reserve.product.date": "Date/Time",
    "delivery.reserve.selected.seat": "Seat",
    "delivery.payment.info.title": "Payment information",
    "delivery.payment.ticket.price": "Ticket Price",
    "delivery.payment.commission.price": "Fee",
    "delivery.payment.additional.product": "Add-on items",
    "delivery.payment.total.amount": "Total Amount",
    "delivery.payment.cancel.period": "Cancellation Deadline",
    "delivery.payment.cancel.fee.info": "Notice on cancel fee by day",
    "delivery.payment.cancel.commission": "Cancellation Fee",
    "delivery.payment.cancel.commission.info": "0~30% of ticket price",
    "delivery.payment.cancel.date": "Cancellation Date ",
    "delivery.payment.cancel.fee.none": "None",
    "delivery.standard.schedule":
      "All schedule are based on local time and date. (KST, GMT +9:00)",
    "delivery.personal.info.title":
      "Consent on providing the personal information to the 3rd party",
    "delivery.personal.info.content.head.first":
      "For the customers who wish to purchase product and services NHN Ticket Link offers, NHN Ticket Link \
  provides the minimum information required for customer consultation and notifying goods information as below.",
    "delivery.personal.info.content.head.second":
      "NHN Ticket Link \
  hereby notifies matters concerning personal information provision as below according to Act on Promotion of Information and Communication Network\
   Utilization and Information Protection. We ask you to thoroughly read the information and agree thereto.",
    "delivery.personal.info.content.body.first":
      "1. Personal information receiver",
    "delivery.personal.info.content.body.second":
      "2. Provided personal information",
    "delivery.personal.info.content.body.second.detail":
      ": name, birthday, ID, e-mail address, [Optional] cell phone number, [Delivery] order/delivery information.",
    "delivery.personal.info.content.body.third":
      "3. Purpose of use of the personal information receiver",
    "delivery.personal.info.content.body.third.detail":
      ": Notice on on-site ticket issuance, casting change and cancellation of show, Customer counseling, such as handling civil complaints, providing benefits and customized services according to service analysis and statistics, surveys and benefits according to service use.",
    "delivery.personal.info.content.body.fourth":
      "4. Period of retention and use of personal information",
    "delivery.personal.info.content.body.fourth.detail":
      ": Until the withdrawal of membership or the achievement of the purpose of using personal information. Provided, That if preservation is necessary pursuant to the provisions of the relevant statutes and if prior consent is obtained, until the relevant retention period.",
    "delivery.personal.info.content.body.fifth":
      "5. Notice on agreement refusal",
    "delivery.personal.info.content.body.fifth.detail":
      "If you fail to this provision on personal information, you can deny the provision and this case your product purchase is subject to be restricted.",
    "delivery.personal.agree.first":
      "I have read and agree to above cancel fee policy and cancel deadline.",
    "delivery.personal.agree.second":
      "I agree that the related information is provided to a third party for customer consultation and show info notice.",
    "delivery.personal.agree.kbo": "I agree that the KBO league safe campaign.",
    "delivery.additional.info": "Additional Information",
    "delivery.payment": "Payment",
    "delivery.payment.delivery.price": "delivery price",
    "delivery.payment.discount.price": "discount",
    "delivery.payment.use.point": "use point",
    "delivery.payment.total.payment": "Total Amount",
    "delivery.payment.info.confirm": "check payment information",

    /*## 배송 선택/ 예매확인*/
    "booking.complete": "Payment",
    "booking.info": "Order Details",
    "booking.number": "Booking number",
    "booking.date": "Date",
    "booking.birthday": "Date of birth",
    "booking.user": "User Confirmation",
    "booking.delivery": "Delivery",
    "booking.ticket.price": "Ticket Price",
    "booking.detail": "Check Ticket Details",
    "booking.cancel.policy": "Cancellation Policy",
    "booking.cancel.policy.info.first":
      "The reservation fee can be refunded only when you cancel on the day of the reservation and it will not be refundable for cancellations made afterwards.",
    "booking.cancel.policy.info.second":
      "If you are revoking the payment made with your credit card, re-reservation will be made upon applying the \
  cancellation fee imposed at the time of cancellation with the same card used during initial purchase. Thus, seasonal promotion and benefits will not be applied including interest-free installment.\n",
    "booking.cancel.policy.info.third":
      "Please note that cancellation and change will not be available if you had lost or damaged your ticket.",

    /* 얼럿 */
    "alert.product.max.count.per.person.exceed":
      "You already purchased same product. So you can purchase only {0} ticket(s) at this product.",
    "alert.product.max.count.per.inning.exceed":
      "You already purchased same time. So you can purchase only {0} ticket(s) at this time. ",
    "alert.product.max.buy.count.per.inning.exceed":
      "You have exceeded the number of times you can purchase. This product can be purchased {0} times per time.",
    "alert.grade.max.count.per.inning.exceed":
      "You already purchased the same seat type. So you can purchase only {0} ticket(s) at this time.",

    "alert.denom.max.count.per.person.exceed":
      "You already purchased same time. So you can purchase only {0} ticket(s) at this time.",
    "alert.denom.max.count.per.inning.exceed":
      "You already purchased same time. So you can purchase only {0} ticket(s) at this time.",
    "alert.denom.max.buy.count.per.inning.exceed":
      "You already purchased same ticket(s). So you can purchase only {0} ticket(s) at this time.",

    "alert.denom.max.schedule.sale.purchase.exceed":
      "You can purchase {0} ticket(s).",
    "alert.denom.max.product.sale.purchase.exceed":
      "You can purchase {0} ticket(s).",

    "alert.denomination.count.exceed": "You can purchase {0} ticket(s).",

    "alert.additionalproduct.count.exceed":
      "There is no quantity available for purchase of the selected addendum.",
    "alert.additionalproduct.max.count.exceed":
      "You can purchase {0} additional product(s). So you can purchase only {1}additional product(s) at this time.",

    "alert.already.preoccupancy":
      "Another customer has occupied the selected seat. Please select another seat.",
    "alert.zone.count.exceed": "Please check the remaining tickets.",
    "alert.exhibition.count.exceed": "Please check the remaining tickets",

    "alert.fail.auto.reserved":
      "This is no adjacent seat by your chosen quantity. " +
      "Please confirm the quantity of seats available for purchase.",
    "alert.fail.auto.non.reserved":
      "There is no adjacent seat by your chosen quantity. Please confirm the quantity of seats available for" +
      " purchase.",

    "alert.seatzone.deatseat.leftorright":
      "You can't leave only single seat. Please select including the rest of the seats.",
    "alert.seatzone.deatseat.seat.together":
      "You can't leave only single seat. Please select including the rest of the seats.",
  };
})();

/**
 * @author donghyun seo
 * @desc i18n 영어 관련
 * @external tk.utils
 */

tk.utils.createNamespace("tk.i18n.ja");
tk.i18n.ja = (function () {
  "use strict";

  return {
    WEEK: ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"],

    SEAT: "Seat",
    COUNT: "Count",
    N_SEATS: "{0} Seat(s)",
    QTY: "QTY",
    N_QTY: "{0}QTY",
    KRW: "ウォン",

    AVAILABLE_SEATS: "予約可能な座席",
    TOTAL: "Total",
    RESET1: "リセット",
    RESET2: "リセット",
    RESET3: "リセット",
    SELECTED_SEATS: "Selected seats",
    QTY_SELECT: "QTY",
    LAYER_CLOSE: "Close",
    DECREASE_COUNT: "Decrease count",
    INCREASE_COUNT: "Increase count",
    OK_1: "OK",
    OK_2: "OK",
    NEXT: "次へ",
    PREVIOUS: "前へ",
    NOW_LOADING: "Now loading",
    NOTICE_ON_PREOCCUPANCY: "Notice on seat type",
    SEAT_SELECT: "Selection type",
    NOTICE_ON_SEAT_PREOCCUPANCY: "座席確保案内",
    NOTICE_ON_SEAT_PREOCCUPANCY_BODY:
      "現在の状態で座席を同時に選択した場合、先に次の手続きに進んだお客様が座席を確保することになります。 そのため、" +
      "座席を選択してから次の手続きに進む時点で、座席が確保されます。 座席選択後、次の画面に進み、8分以内に決済を行ってください。 5分以内に決済が行われない場合、" +
      "選択した座席は他のお客様のため、リセットされます。",
    VIEW_ALL: "View all",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    SOLD_OUT: "Sold out",
    TOOLTIP_VIEW_ALL: "Back(Reset)",
    TOOLTIP_ZOOM_IN: "Zoom in",
    TOOLTIP_ZOOM_OUT: "Zoom out",
    TOOLTIP_REFRESH: "Refresh",

    PLEASE_SELECT_SEAT: "Please select seat(s).",
    PLEASE_SELECT_QTY: "Please select quantity.",
    PLEASE_CONTACT_SERVICE_CENTER: "Please contact service center.",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_1:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_2:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    PURCHASE_TOTAL_MAXIMUM_N_TICKET: "You can purchase maximum {0}ticket(s).",
    PURCHASE_GRADE_MAXIMUM_N_TICKET: " maximum {0}ticket(s) at this time.",
    THIS_IS_NOT_FOR_SALE: "This is not for sale.",
    THERE_IS_NO_SEAT_AVAILABLE: "There is no seat to purchase.",
    THERE_IS_NO_SEAT_AVAILABLE_FOR_PURCHASE:
      "There is no seat available for purchase.",
    PLEASE_SELECT_SEAT_OF_SAME_GRADE_AS_SELECTED_GRADE:
      "Please select a seat of the same grade as the selected grade.",
    THIS_SEAT_TYPE_CAN_NOT_BE_PURCHASED_NOW:
      "This seat type can not be purchased now.",

    CLEAN_RESERVATION_TITLE: "Clean Ticketing service",
    CLEAN_RESERVATION_DESCRIPTION:
      "否定の予約販売を防止するため、セキュリティの文字入力後、前売りが可能です。",
    CAPTCHA_AUTH_FAIL_MESSAGE: "正確に入力してください。",
    RESELECT_DATE: "日付をまた選択",

    "alert.additionalproduct.count.exceed":
      "選択した付加商品の購入可能数量がありません。",

    SELECTED_SEAT_INFO_SELECT_GRADE:
      "Select a seat type first, then then a seating selection type",
    SELECTED_SEAT_INFO_SELECT_AUTO: "Select a seat type and number of tickets",
    SELECTED_SEAT_INFO_SELECT_DIRECT: "Select your seat",

    SELECTED_TYPE: "Select a seating selection type",
    SELECTED_TYPE_AUTO: "Auto assignment",
    SELECTED_TYPE_DIRECT: "Seat selection",
    SELECTED_TYPE_INFO_AUTO1:
      "Auto assignment : Adjacent seats will be randomly assigned within",
    SELECTED_TYPE_INFO_AUTO2:
      "your chosen seat type (Regardless of the selected ",
    SELECTED_TYPE_INFO_AUTO3: "area)",
    SELECTED_TYPE_INFO_DIRECT:
      "Seat selection :select your seat within your chosen section",

    "plan.seat.api.error":
      "Failed to load seat information.\nReload information.",
  };
})();

/**
 * @author donghyun seo
 * @desc i18n 영어 관련
 * @external tk.utils
 */

tk.utils.createNamespace("tk.i18n.zh");
tk.i18n.zh = (function () {
  "use strict";

  return {
    WEEK: ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"],

    SEAT: "Seat",
    COUNT: "Count",
    N_SEATS: "{0} Seat(s)",
    QTY: "QTY",
    N_QTY: "{0}QTY",
    KRW: "韩元",

    AVAILABLE_SEATS: "可选的座位",
    TOTAL: "Total",
    RESET1: "初始化",
    RESET2: "初始化",
    RESET3: "初始化",
    SELECTED_SEATS: "Selected seats",
    QTY_SELECT: "QTY",
    LAYER_CLOSE: "Close",
    DECREASE_COUNT: "Decrease count",
    INCREASE_COUNT: "Increase count",
    OK_1: "OK",
    OK_2: "OK",
    NEXT: "下一步",
    PREVIOUS: "上一步",
    NOW_LOADING: "Now loading",
    NOTICE_ON_PREOCCUPANCY: "Notice on seat type",
    SEAT_SELECT: "Selection type",
    NOTICE_ON_SEAT_PREOCCUPANCY: "关于座位先占",
    NOTICE_ON_SEAT_PREOCCUPANCY_BODY:
      "若在此状态多人同时选中座位时，谁先转至下一步谁先占座位。 因此，在选座位后移动至下一步的时点就会决定是否选完座位。" +
      " 选中座位后，您应在移动到下一步后8分钟内予以支付。 若您未在五分钟内支付完，您选中的座位就会被初始化，给其他客户显示。",
    STAGE_DIRECTION: "Stadium/Stage direction",
    VIEW_ALL: "View all",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    SOLD_OUT: "Sold out",
    TOOLTIP_VIEW_ALL: "Back(Reset)",
    TOOLTIP_ZOOM_IN: "Zoom in",
    TOOLTIP_ZOOM_OUT: "Zoom out",
    TOOLTIP_REFRESH: "Refresh",

    PLEASE_SELECT_SEAT: "Please select seat(s).",
    PLEASE_SELECT_QTY: "Please select quantity.",
    PLEASE_CONTACT_SERVICE_CENTER: "Please contact service center.",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_1:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    SEAT_TYPE_CAN_NOT_BE_PURCHASE_2:
      "These seat type can not be purchased together.\nPlease reset seat(s).",
    PURCHASE_TOTAL_MAXIMUM_N_TICKET: "You can purchase maximum {0}ticket(s).",
    PURCHASE_GRADE_MAXIMUM_N_TICKET:
      "You can purchase maximum {0}ticket(s) at this time.",
    THIS_IS_NOT_FOR_SALE: "This is not for sale.",
    THERE_IS_NO_SEAT_AVAILABLE: "There is no seat to purchase.",
    THERE_IS_NO_SEAT_AVAILABLE_FOR_PURCHASE:
      "There is no seat available for purchase.",
    PLEASE_SELECT_SEAT_OF_SAME_GRADE_AS_SELECTED_GRADE:
      "Please select a seat of the same grade as the selected grade.",
    THIS_SEAT_TYPE_CAN_NOT_BE_PURCHASED_NOW:
      "This seat type can not be purchased now.",

    CLEAN_RESERVATION_TITLE: "Clean Ticketing service",
    CLEAN_RESERVATION_DESCRIPTION:
      "为防止非法预售,可在输入安全短信后进行预售。",
    CAPTCHA_AUTH_FAIL_MESSAGE: "请准确输入。",
    RESELECT_DATE: "日期再选择",

    "alert.additionalproduct.count.exceed": "所选附加商品的可购买数量不存在。",

    SELECTED_SEAT_INFO_SELECT_GRADE:
      "Select a seat type first, then then a seating selection type",
    SELECTED_SEAT_INFO_SELECT_AUTO: "Select a seat type and number of tickets",
    SELECTED_SEAT_INFO_SELECT_DIRECT: "Select your seat",

    SELECTED_TYPE: "Select a seating selection type",
    SELECTED_TYPE_AUTO: "Auto assignment",
    SELECTED_TYPE_DIRECT: "Seat selection",
    SELECTED_TYPE_DIRECT1: "Seat",
    SELECTED_TYPE_DIRECT2: "selection",
    SELECTED_TYPE_INFO_AUTO1:
      "Auto assignment : Adjacent seats will be randomly assigned within",
    SELECTED_TYPE_INFO_AUTO2:
      "your chosen seat type (Regardless of the selected ",
    SELECTED_TYPE_INFO_AUTO3: "area)",
    SELECTED_TYPE_INFO_DIRECT:
      "Seat selection : select your seat within your chosen section",

    "plan.seat.api.error":
      "Failed to load seat information.\nReload information.",
  };
})();

/**
 * @author donghyun seo
 * @desc i18n 관련
 * @external tk.utils, tk.exceptions
 */

tk.utils.createNamespace("tk.i18n.translate");
tk.i18n.translate = (function () {
	'use strict';

	var scope = {};
	var BASIC_LANGUAGE = 'en';

	scope.locale = null;

	scope.init = _init;
	scope.getTranslate = _getTranslate;
	scope.getTranslateByLocale = _getTranslateByLocale;

	/**
	 * @description i18n 초기화
	 * @param {String} locale 설정할 locale
	 */
	function _init (locale) {
		scope.locale = locale;
	}

	/**
	 * @description i18n이 적용된 값을 반환
	 *                key 이후의 값은 format 문자열의 치환값으로 간주한다.
	 * @param {String} key i18n이 적용된 값을 가져올 key
	 * @return {String} key i18n이 적용된 값을 가져올 key
	 */
	function _getTranslate (key) {
		var args;
		var locale = scope.locale;

		// argument 가 3개 이상이면 format 을 사용하여 처리
		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments, 1);
		}

		return getTranslate(locale, key, args);
	}

	/**
	 * @description 특정 locale에 대한 i18n이 적용된 값을 반환
	 *                key 이후의 값은 format 문자열의 치환값으로 간주한다.
	 * @param {String} locale 특정 locale
	 * @param {String} key i18n이 적용된 값을 가져올 key
	 * @return {String} key i18n이 적용된 값을 가져올 key
	 */
	function _getTranslateByLocale (locale, key) {
		var args;
		locale = locale || scope.locale;

		// argument 가 3개 이상이면 format 을 사용하여 처리
		if (arguments.length > 2) {
			args = Array.prototype.slice.call(arguments, 2);
		}

		return getTranslate(locale, key, args);
	}

	/**
	 * @description i18n이 적용된 값을 반환
	 * @param {String} locale 특정 locale
	 * @param {String} key i18n이 적용된 값을 가져올 key
	 * @param {Array} args key 이후의 값은 format 문자열의 치환값
	 * @return {String} key i18n이 적용된 값을 가져올 key
	 */
	function getTranslate (locale, key, args) {
		var translate;
		var i18n = null;

		// key 가 존재하지 않으면
		if (typeof (key) !== 'string') {
			throw new tk.exceptions.IllegalArgumentException('Translate key must be string : ' + key);
		}

		// 해당 locale 을 지원하는지 여부
		if (tk.i18n.hasOwnProperty(locale)) {
			i18n = tk.i18n[locale];
		} else {
			i18n = tk.i18n[BASIC_LANGUAGE];
		}

		translate = i18n[key] !== undefined ? i18n[key] : tk.i18n[BASIC_LANGUAGE][key];

		// argument 가 3개 이상이면 format 을 사용하여 처리
		if (translate && args) {
			translate = tk.utils.format.apply(translate, args);
		}
		return translate;
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc service 관련 event
 * @external tk.utils
 */

tk.utils.createNamespace("tk.event.service");
tk.event.service = (function () {
  "use strict";

  var scope = {};

  var SIGNALS = signals;
  scope.signals = {
    refreshMainView: new SIGNALS.Signal(), // 페이지 좌석 새로고침

    // Data Controller
    updateReservationData: new SIGNALS.Signal(), // 예매 정보 갱신
    updateReservationSeatData: new SIGNALS.Signal(), // 예매 좌석 정보 갱신
    updateReservationSeatDataByArea: new SIGNALS.Signal(), // 예매 그리드 좌석 정보 갱신
    updateReservationSeatDataByAreaWithKey: new SIGNALS.Signal(), // 예매 그리드 좌석 정보 갱신 (key에 의해서)
    updateReservationSeatDataByBlock: new SIGNALS.Signal(), // 예매 영역 좌석 정보 갱신
    updateReservationSeatDataBySector: new SIGNALS.Signal(), // 섹터 좌석 정보 갱신
    updateAllCanvasByArea: new SIGNALS.Signal(), // 그리드 좌석 정보 갱신
    updateAllCanvasByAreaWithKeys: new SIGNALS.Signal(), // 그리드 좌석 정보 갱신 (key에 의해서)
    updateAllCanvasByBlock: new SIGNALS.Signal(), // 영역 좌석 정보 갱신
    updateAllCanvasByBlockArea: new SIGNALS.Signal(), // 영역 페이징 좌석 정보 갱신
    updateSeatSoldoutByArea: new SIGNALS.Signal(), // 그리드 좌석 판매 정보 갱신
    updateSeatSoldoutByAreaWithKeys: new SIGNALS.Signal(), // 그리드 좌석 판매 정보 갱신 (key에 의해서)
    updateSeatSoldoutByBlock: new SIGNALS.Signal(), // 영역 좌석 판매 정보 갱신
    updateSeatWaitingLinked: new SIGNALS.Signal(), // [취소표대기] 좌석 묶음 정보 갱신WaitingLinked
    updateAliveGrade: new SIGNALS.Signal(), // [취소표대기] 활성화된 등급 정보

    updatedReservationData: new SIGNALS.Signal(), // 예매 정보 갱신 후
    updatedReservationSeatData: new SIGNALS.Signal(), // 예매 좌석 정보 갱신 후
    updatedReservationSeatDataByArea: new SIGNALS.Signal(), // 예매 그리드 좌석 정보 갱신 후
    updatedReservationSeatDataByAreaWithKey: new SIGNALS.Signal(), // 예매 그리드 좌석 정보 갱신 후 (key에 의해서)
    updatedReservationSeatDataByBlock: new SIGNALS.Signal(), // 예매 영역 좌석 정보 갱신 후
    updatedReservationSeatDataBySector: new SIGNALS.Signal(), // 섹터 좌석 정보 갱신 후
    updatedAllCanvasByArea: new SIGNALS.Signal(), // 그리드 좌석 정보 갱신 후
    updatedAllCanvasByBlock: new SIGNALS.Signal(), // 영역 좌석 정보 갱신 후
    updatedAllCanvasByBlockArea: new SIGNALS.Signal(), // 영역 페이징 좌석 정보 갱신 후
    updatedSeatSoldoutByArea: new SIGNALS.Signal(), // 그리드 좌석 판매 정보 갱신 후
    updatedSeatSoldoutByBlock: new SIGNALS.Signal(), // 영역 좌석 판매 정보 갱신 후

    preOccupancy: new SIGNALS.Signal(), // 선점
    callWaitingReservationRequest: new SIGNALS.Signal(), // 예매대기 신청
    cleanWaitingReservationInfo: new SIGNALS.Signal(), // 예매대기 관련 정보 초기화

    // Service to UI
    s2u_gradeLoadingToggle: new SIGNALS.Signal(), // 등급 정보 갱신 시 로딩
    s2u_updatedSelectedSeat: new SIGNALS.Signal(), // 선택된 좌석 정보 갱신
    s2u_updatedSelectedBlock: new SIGNALS.Signal(), // 선택된 영역 정보 갱신
    s2u_updatedWaitingInfo: new SIGNALS.Signal(), // 예매대기 상태 업데이트
    s2u_updatedSectionInBlock: new SIGNALS.Signal(), // 구역 상태 업데이트
  };

  return scope;
})();

/**
 * @author donghyun seo
 * @desc UI 관련 event
 * @external tk.utils
 */

tk.utils.createNamespace("tk.event.ui");
tk.event.ui = (function () {
	'use strict';

	var scope = {};

	var SIGNALS = signals;
	scope.signals = {
		gradeClear: new SIGNALS.Signal(), // 등급선택 초기화
		gradeMark: new SIGNALS.Signal(), // 등급선택 표시
		zoneClear: new SIGNALS.Signal(), // 등급선택 내 영역 초기화
		zoneRefresh: new SIGNALS.Signal(), // 등급 선택내 영역 갱신

		popupZone: new SIGNALS.Signal(), // 비지정 선택 팝업
		popupBlock: new SIGNALS.Signal(), // 유형 선택 팝업
		popupPartZoneSelect: new SIGNALS.Signal(), // 부분 화면내 비지정 선택 팝업
		popupAutoSelect: new SIGNALS.Signal(), // 자동배정 선택 팝업
		popupCloseAll: new SIGNALS.Signal(), // 전체 팝업창 종료

		popupNotifyShow: new SIGNALS.Signal(), // 취소표 신청 연락정보 팝업

		updatePopupData: new SIGNALS.Signal(), // 팝업 내 데이터 수정

		dimmedOn: new SIGNALS.Signal(), // dimmed on
		dimmedOff: new SIGNALS.Signal(), // dimmed off

		backToArea: new SIGNALS.Signal(), // 구역 보기
		zoom: new SIGNALS.Signal(), // zoom

		updateStageDirection: new SIGNALS.Signal(), // 무대방향 표시 업데이트

		updateWaitingDetail: new SIGNALS.Signal(), // 예매대기 정보 업데이트
		updateSelectedGrade: new SIGNALS.Signal(), // 선택된 등급 정보 업데이트
		updateMobileCss: new SIGNALS.Signal(), // 모바일 전용 CSS 업데이트
		refreshWaitingDetail: new SIGNALS.Signal(), // 새로고침시 초기화 업데이트
		asyncBackButton: new SIGNALS.Signal(), // 모바일 뒤로가기 버튼 관랸 값 동기화

	};

	return scope;
})();
/**
 * @author donghyun seo
 * @desc view 관련 event
 * @external tk.utils
 */

tk.utils.createNamespace("tk.event.view");
tk.event.view = (function () {
	'use strict';

	var scope = {};

	var SIGNALS = signals;
	scope.signals = {
		//영역으로 이동
		gotoSeatPlanEvent: new SIGNALS.Signal(),
		gotoAreaPlan: new SIGNALS.Signal(), // 영역으로 이동

		// 리사이즈 처리
		resizeView: new SIGNALS.Signal(),
		resizedView: new SIGNALS.Signal(),

		// 도면 렌더(사석)
		updateRenderDeadSeat: new SIGNALS.Signal(),

		// 도면 준비
		viewStandby: new SIGNALS.Signal()
	};

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 캔버스 Utils
 * @external tk.utils, tk.exceptions
 */

tk.utils.createNamespace("tk.util.canvas");
tk.util.canvas = (function () {
	'use strict';

	var scope = {};

	scope.canvasSupport = _canvasSupport;
	scope.getCanvasContext = _getCanvasContext;
	scope.clearCanvas = _clearCanvas;
	scope.getImage = _getImage;
	scope.isPointInside = _isPointInside;
	scope.isPointInsideBySphere = _isPointInsideBySphere;

	/**
	 * @description 캔버스 지원 여부
	 * @return {Boolean} 캔버스 지원 여부
	 */
	function _canvasSupport () {
		return !!document.createElement('canvas').getContext;
	}

	/**
	 * @description 캔버스 컨텍스트 생성
	 * @return {Object} canvas 지원 여부
	 * @throws {CanvasNotSupportException}
	 */
	function _getCanvasContext (canvas) {
		// Canvas 체크
		if (!scope.canvasSupport() || !canvas.getContext) {
			throw new tk.exceptions.CanvasNotSupportException();
		} else {
			return canvas.getContext('2d');
		}
	}

	/**
	 * @description 캔버스 화면 초기화
	 */
	function _clearCanvas (context, x, y, width, height) {
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(x, y, width, height);
		context.restore();
	}

	/**
	 * @description 이미지 로드
	 * @param {String} url 이미지 주소
	 * @param {Object} opt 이미지 옵션 (해당 이미지에 주입)
	 * @return {Object} 이미지
	 */
	function _getImage (url, opt) {
		var dfd = $.Deferred();

		if (tk.utils.hasProperty(opt, 'parameter')) {
			if (!url) {
				return undefined;
			}
			angular.forEach(opt.parameter, function (val, key) {
				url = url.replace(new RegExp('{' + key + '}', 'g'), val);
			});
		}

		var img = new Image();
		img.opt = opt;
		img.crossOrigin = "Anonymous";

		dfd.notify(img);

		// 이미지 로드 완료
		img.onload = function () {
			dfd.resolve(img);
			img.$resolved = true;
		};

		// 이미지 로드 실패
		img.onerror = function () {
			dfd.reject(img);
		};

		img.src = url;
		img.$promise = dfd;
		img.$resolved = false;
		return img;
	}

	/**
	 * @description 좌표가 안에 있는지 여부 반환 (Jordan curve thoerem)  (제거 예정)
	 * @param {Object} point 확인할 좌표
	 * @param {Array} corners 확인할 도형의 꼭지점
	 * @param {Number} scale 스케일
	 * @return {Boolean} 좌표가 안에 있는지 여부
	 */
	function _isPointInside (point, corners, scale) {
		scale = scale !== undefined ? scale : 1;

		var x = point.x, y = point.y;

		var inside = false;
		for (var i = 0, j = corners.length - 1; i < corners.length; j = i++) {
			var xi = corners[i].x * scale, yi = corners[i].y * scale;
			var xj = corners[j].x * scale, yj = corners[j].y * scale;

			var intersect = ((yi > y) !== (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}

		return inside;
	}

	/**
	 * @description 좌표가 안에 있는지 여부 반환 (Sphere) (제거 예정)
	 * @param {Object} originPoint 중심 좌표
	 * @param {Object} targetPoint 확인할 좌표
	 * @param {Number} scale 스케일
	 * @param {Number} distance 거리 범위
	 * @return {Boolean} 좌표가 안에 있는지 여부
	 */
	function _isPointInsideBySphere (originPoint, targetPoint, scale, distance) {
		scale = scale !== undefined ? scale : 1;
		distance = distance !== undefined ? distance : 7;
		var ox = originPoint.x;
		var oy = originPoint.y;
		var tx = targetPoint.x * scale;
		var ty = targetPoint.y * scale;
		var d = distance * scale;
		return Math.sqrt((ox - tx) * (ox - tx) + (oy - ty) * (oy - ty)) < d;
	}

	return scope;
})();
var Singletonify = function (cons) {
	'use strict';

	var INSTANCE;

	var c = function () {
		if (INSTANCE === undefined) {

			var F = function () {
			};
			F.prototype = cons.prototype;

			var t = new F();
			var ret = cons.apply(t, Array.prototype.slice.call(arguments));

			INSTANCE = (typeof ret === 'object') ? ret : t;
		}

		return INSTANCE;
	};

	c.getInstance = function () {
		return c.apply(null, Array.prototype.slice.call(arguments));
	};

	return c;
};

/**
 * @author donghyun seo
 * @desc ajax Manager
 * @external tk.utils
 */

tk.utils.createNamespace("tk.api.ajax");
tk.api.ajax = (function () {
	'use strict';

	var scope = {};
	var pendingAjax = {};

	scope.apiCallResponse = _apiCallResponse;
	scope.ajaxSetup = _ajaxSetup;
	scope.getMethod = _getMethod;

	/**
	 * @description Api Call 후 행동
	 * @param {Object} promise promise
	 * @param {Object} opts 옵션
	 * @param {Object} stateWithKey { state: AjaxObject, key: string }
	 */
	function _apiCallResponse (promise, opts, stateWithKey) {
		var isOptsObject = typeof (opts) === 'object';
		var hasTimer = isOptsObject && opts.hasOwnProperty('timer') ? opts.timer : false;
		var message;
		var error;
		var timer = null;

		// 타이머 설정
		if (hasTimer) {
			// message = isOptsObject && opts.hasOwnProperty('message') ? opts.message : '';
			timer = loading.start(1000 * 60 * 2, function () {
			});
		}

		if (stateWithKey) {
			if (stateWithKey.state) {
				pendingAjax[stateWithKey.key] = stateWithKey.state;
			}
		}

		promise.done(function (q) { // 성공시 액션
			if (stateWithKey) {
				if (stateWithKey.key) {
					delete pendingAjax[stateWithKey.key];
				}
			}

			if (hasTimer) { // 설정된 타이머 종료
				loading.stop(timer);
			}

			// 오류 처리
			if (q.hasOwnProperty('result') && hasErrorCode(q.result)) {
				if (q.result.hasOwnProperty('message')) {
					message = q.result.message;
				} else if (q.hasOwnProperty('data')) {
					message = q.data;
				} else {
					message = "관리자에게 문의하세요.";
				}

				/** haproxy redirect */
				if (q.result.code === 302) {
					if (q.result.redirectUrl) {
						location.href = q.result.redirectUrl;
						return;
					}
					message = '';
				} else if (q.result.code === 2001) {
					window.location.reload();
					message = '';
					return;
				}

				error = {
					code: q.result.code,
					message: message
				};
			} else if (hasErrorCode(q)) {
				error = {
					code: q.code,
					message: q.data
				};
			}

			if (isOptsObject && opts.hasOwnProperty('done')) { // 주어진 성공 콜백 실행
				opts.done(q, error);
			}
		}).fail(function (kill, errMessage) { // 실패시 액션
			if (kill.statusText === 'abort') {
				return;
			}

			var keys = Object.keys(pendingAjax);
			try {
				for (var i = 0; i < keys.length; i++) {
					console.log('pendingAjax[keys[i]]', pendingAjax[keys[i]]);
					pendingAjax[keys[i]].abort();
				}
				pendingAjax = {};
			} catch (e) {
				console.log('end of api key..');
			}
			console.log('kill', kill.statusText);

			if (hasTimer) { // 설정된 타이머 종료
				loading.stop(timer);
			}
			if (isOptsObject && opts.hasOwnProperty('fail')) { // 주어진 실패 콜백 실행
				opts.fail(kill, errMessage);
			}
		});
	}

	/**
	 * @description 에러 코드 존재 여부
	 * @param {Object} q Api data
	 * @return {Boolean} 에러 코드 존재 여부
	 */
	function hasErrorCode (q) {
		if (!q) {
			return;
		}

		return q.hasOwnProperty('code') && q.code !== 0;
	}

	/**
	 * @description ajax 설정
	 * @param {Object} setup ajax 설정 객체
	 */
	function _ajaxSetup (setup) {
		$._ajaxSetup(setup);
	}

	/**
	 * @description Ajax method 모음
	 * @param {Object} options 옵션
	 * @return {Object} ajax 메서드 모음
	 */
	function _getMethod (options) {
		var plainOption = JSON.parse(JSON.stringify(options));
		plainOption.contentType = 'text/plain';
		return {
			ajax: new ajax(options),
			get: new ajax(plainOption, 'GET'),
			post: new ajax(options, 'POST'),
			put: new ajax(options, 'PUT'),
			patch: new ajax(options, 'PATCH'),
			delete: new ajax(options, 'DELETE')
		};
	}

	/**
	 * @description Ajax
	 * @param {Object} configOptions 옵션
	 * @param {String} method 메서드
	 * @return {object} 상태, Promise, 결과를 포함하는 객체
	 */
	function ajax (configOptions, method) {
		return function (options, parameter) {
			var resource = {};
			var dfd = $.Deferred();
			var defaultOptions = {
				type: method,
				cache: false,
				success: function (data, textStatus, jqXHR) {
					resource.$resolved = true;
					resource.$status = textStatus;
					$.extend(resource, data);
					dfd.resolve(resource, textStatus, jqXHR);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					resource.$status = textStatus;
					dfd.reject(jqXHR, textStatus, errorThrown);
				}
			};

			$.extend(defaultOptions, configOptions);
			$.extend(defaultOptions, options);

			if (defaultOptions.data && isJsonType) {
				defaultOptions.data = JSON.stringify(defaultOptions.data);
			}

			if (parameter !== undefined) {
				defaultOptions.url = setUrl(defaultOptions.url, parameter);
			}

			var callAjax = $.ajax(defaultOptions);

			resource.$state = callAjax;
			resource.$promise = dfd;
			resource.$resolved = false;
			resource.$status = undefined;
			return resource;
		};
	}

	/**
	 * @description Url 파라미터 설정
	 * @param {String} url 설정할 Url
	 * @param {Object} parameter 설정할 파라미터
	 * @return {String} 설정된 Url
	 */
	function setUrl (url, parameter) {
		var query = [];
		if (parameter) {
			_.each(parameter, function (val, key) {
				var param = ':' + key;
				if (!tk.utils.includes.call(url, param)) {
					query.push(key + '=' + val);
				} else {
					url = url.replace(new RegExp(':' + key, 'g'), val);
				}
			});
		}

		if (query.length > 0) {
			url += '?' + query.join('&');
		}
		return url;
	}

	/**
	 * @description Ajax Type 의 JSON 여부
	 * @param {String} contentType contentType
	 * @param {String} dataType dataType
	 * @return {Boolean} JSON 여부
	 */
	function isJsonType (contentType, dataType) {
		return includes.call(contentType, 'json') || includes.call(dataType, 'json');
	}

	return scope;
})();


/**
 * @author donghyun seo
 * @desc 예매 관련 Api
 * @external tk.utils, tk.exceptions, tk.api.ajax
 */

tk.utils.createNamespace('tk.api.reservePlan');
tk.api.reservePlan = (function () {
  'use strict';

  var scope = {};
  var ready = false;
  var ajax;
  var url;
  var scheduleId;
  var apiCallResponse;
  var frontPlanTypeCode;

  scope.init = _init;
  scope.getMeta = _getMeta;
  scope.getGrades = _getGrades;
  scope.getGradesInBlock = _getGradesInBlock;
  scope.getAllCanvasArea = _getAllCanvasArea;
  scope.getAllCanvasBlock = _getAllCanvasBlock;
  scope.getAllCanvasBlockArea = _getAllCanvasBlockArea;
  scope.getSeatSoldoutArea = _getSeatSoldoutArea;
  scope.getSeatSoldoutBlock = _getSeatSoldoutBlock;
  scope.preOccupancy = _preOccupancy;
  scope.cancelPreOccupancy = _cancelPreOccupancy;
  scope.getZoneRemain = _getZoneRemain;
  scope.availCount = _availCount;
  scope.verifyCount = _verifyCount;
  scope.waitingReservationRequest = _waitingReservationRequest;
  scope.waitingReservationSchedules = _waitingReservationSchedules;
  scope.waitingReservationGrades = _waitingReservationGrades;
  scope.waitingAlreadySeats = _waitingAlreadySeats;
  scope.getSeatWaitingLinked = _getSeatWaitingLinked;

  scope.availableRefresh = _availableRefresh;

  /**
   * @description 초기화
   * @param {Object} config 설정 객체
   */
  function _init(config) {
    ajax = tk.api.ajax.getMethod(config.ajaxOptions);
    url = config.domain + config.version + config.prefix;

    scheduleId = config.scheduleId;
    apiCallResponse = tk.api.ajax.apiCallResponse;
    if (tk.state.global.meta.hasOwnProperty('frontPlanTypeCode')) {
      frontPlanTypeCode = tk.state.global.meta.frontPlanTypeCode;
    }
    ready = true;
  }

  /**
   * @description 메타 정보
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getMeta(opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Meta');

    var _id = getId(opts);

    var promise = ajax.get(
      {
        url: url + '/schedules/:scheduleId'
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getMeta' });
    tk.state.develop.debugTimeEndByPromise(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Meta', promise.$promise);

    return promise;
  }

  /**
   * @description 등급 정보
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getGrades(opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Grade');

    var _id = getId(opts);

    var reqUrl = url + '/schedules/:scheduleId/grades';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }
    var promise = ajax.get(
      {
        url: reqUrl
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getGrades' });
    tk.state.develop.debugTimeEndByPromise(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Grade', promise.$promise);

    return promise;
  }

  /**
   * @description 영역 내 등급 정보
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getGradesInBlock(opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Blocks Grades');

    var _id = getId(opts);

    var reqUrl = url + '/schedules/:scheduleId/blocks/grades';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }
    var promise = ajax.get(
      {
        url: reqUrl
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getGradesInBlock' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Blocks Grades',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 패이징 내 좌석
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getAllCanvasArea(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Seat All Area');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/seat-all/canvas/area';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }
    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getAllCanvasArea' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Seat All Area',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 영역 내 좌석
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getAllCanvasBlock(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Seat All Block');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/seat-all/canvas/block';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }
    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getAllCanvasBlock' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Seat All Block',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 영역 페이징 내 좌석
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getAllCanvasBlockArea(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }

    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Seat All Block Area');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/seat-all/canvas/block2';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }

    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getAllCanvasBlockArea' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Seat All Block Area',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 패이징 내 좌석 판매 여부
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getSeatSoldoutArea(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Seat Sold Out Area');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/seat-soldout/area';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }

    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getSeatSoldOutArea' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Seat Sold Out Area',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 영역 내 좌석 판매 여부
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getSeatSoldoutBlock(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Get Seat Sold Out Block Area');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/seat-soldout/block';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }

    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getSeatSoldOutBlock' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Get Seat Sold Out Block Area',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 선점
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _preOccupancy(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Preoccupancy');

    var _id = getId(opts);

    var reqUrl = url + '/occupy/schedules/:scheduleId/';
    if (tk.utils.isWaitingReservation()) {
      reqUrl = url + '/waiting/preoccupancy/schedules/:scheduleId/';
    }

    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    promise.$promise.requestUrl = reqUrl;

    apiCallResponse(promise.$promise, opts);
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Preoccupancy',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 선점 취소
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _cancelPreOccupancy(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Cancel Preoccupancy');

    var _id = getId(opts);

    var promise = ajax.post(
      {
        url: url + '/cancel/preoccupancy/schedules/:scheduleId/',
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts);
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Cancel Preoccupancy',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 남은 비지석 매수
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getZoneRemain(opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Zone Remain');

    var _id = getId(opts);

    var reqUrl = url + '/:scheduleId/zone/remain';
    if (tk.utils.isWaitingReservation()) {
      reqUrl += waitingUrlQueryString();
    }

    var promise = ajax.get(
      {
        url: reqUrl
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getZoneRemain' });
    tk.state.develop.debugTimeEndByPromise(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Zone Remain', promise.$promise);

    return promise;
  }

  /**
   * @description Get Id
   * @param {Object} opts 옵션
   * @return {String|Number} 스케쥴 Id
   */
  function getId(opts) {
    validateId(opts);

    if (opts && opts.hasOwnProperty('id')) {
      return opts.id;
    }
    return scheduleId;
  }

  /**
   * @description ID 유효성 체크
   * @param {Object} opts 옵션
   * @throws {ApiNotReadyException}
   */
  function validateId(opts) {
    if (typeof opts === 'object' && opts.hasOwnProperty('id')) {
      return;
    }

    if (scheduleId) {
      return;
    }

    throw new tk.exceptions.ApiNotReadyException('Can not found Id');
  }

  /**
   * @description 예매대기 URL 반환
   * @return {string} 예매대기 URL
   */
  function waitingUrlQueryString() {
    var count = tk.state.waitingDetail.currentTicketCount;
    var reservationType = tk.state.waitingDetail.getReservationType();
    var queryString = '?';
    queryString += 'frontPlanTypeCode=' + frontPlanTypeCode;
    queryString += '&selectCnt=' + count;
    if (reservationType === 'SECTION') {
      queryString += '&requestType=' + reservationType;
    }
    return queryString;
  }

  /**
   * @description 매수선택 셀렉트박스
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _availCount(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Preoccupancy');

    var _id = getId(opts);

    _body.scheduleId = _id;

    var promise = ajax.post({
      url: '/reserve/waiting/api/avail/count',
      data: _body
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'availCount' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Preoccupancy',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 예매대기 구매가능 잔여횟수 가져오기
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _verifyCount(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Preoccupancy');

    var _id = getId(opts);

    _body.scheduleId = _id;

    var promise = ajax.post({
      url: '/reserve/waiting/api/verify/count',
      data: _body
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'verifyCount' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Preoccupancy',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 예매대기 신청하기
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _waitingReservationRequest(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Preoccupancy');

    var _id = getId(opts);

    var promise = ajax.put({
      url: '/reserve/waiting/schedule/' + _id,
      data: _body
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'waitingReservationRequest' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Waiting Reservation Request',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 예매대기 스케쥴 정보 가져오기
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _waitingReservationSchedules(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Waiting Reservation Schedules');

    var promise = ajax.post({
      url: '/reserve/waiting/api/schedules',
      data: _body.productId
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'waitingReservationSchedules' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Waiting Reservation Schedules',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 예매대기 등급 정보 가져오기
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _waitingReservationGrades(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] waitingReservationGrades');

    var promise = ajax.post({
      url: '/reserve/waiting/api/avail/grades',
      data: _body
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'waitingReservationGrades' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] waitingReservationGrades',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 이미 신청한 좌석 ID 조회
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _waitingAlreadySeats(opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] waitingAlreadySeats');

    var _id = getId(opts);
    var reqUrl = '/reserve/waiting/api/application/' + _id + '/already';

    var promise = ajax.get({
      url: reqUrl
    });
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'waitingAlreadySeats' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] waitingAlreadySeats',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description [취소표대기] 좌석 묶음 정보
   * @param {Object} _body 본문
   * @param {Object} opts 옵션
   * @return {Object} promise
   * @throws {ApiNotReadyException}
   */
  function _getSeatWaitingLinked(_body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Reserve Plan Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] getSeatWaitingLinked');

    var _id = getId(opts);
    var reqUrl = url + '/:scheduleId/seat-waiting-linked/area';
    reqUrl += '?frontPlanTypeCode=WAITING_APPLICATION';
    reqUrl += '&requestType=SEAT';

    var promise = ajax.post(
      {
        url: reqUrl,
        data: _body
      },
      {
        scheduleId: _id
      }
    );
    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getSeatWaitingLinked' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] getSeatWaitingLinked',
      promise.$promise
    );

    return promise;
  }

  /**
   * 잔여석 여부 체크
   * @param _body
   * @param opts
   * @returns {*}
   * @private
   */
  function _availableRefresh(body, opts) {
    if (!isReady()) {
      throw new tk.exceptions.ApiNotReadyException('Available Refresh Api is not ready.');
    }
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.API, '[API] Available Refresh');

    var _id = getId(opts);
    var reqUrl = url + '-meta/:scheduleId/available-refresh';
    reqUrl += '?productId=' + body.productId;
    reqUrl += '&scheduleId=' + body.scheduleId;
    reqUrl += '&productClassCode=' + body.productClassCode;
    // '/api/V2/plan-meta'에 요청

    var promise = ajax.get(
      {
        url: reqUrl,
        async: false
      },
      {
        scheduleId: _id
      }
    );

    apiCallResponse(promise.$promise, opts, { state: promise.$state, key: 'getSeatWaitingLinked' });
    tk.state.develop.debugTimeEndByPromise(
      tk.state.develop.DEBUG_TIME_TYPE.API,
      '[API] Available Refresh',
      promise.$promise
    );

    return promise;
  }

  /**
   * @description 예매 Api 준비 여부
   * @return {Boolean} Api 준비 여부
   */
  function isReady() {
    return ready;
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc API 모음 객체
 * @external tk.utils, tk.api.reservePlan
 */

tk.utils.createNamespace("tk.apis");
tk.apis = (function () {
	'use strict';

	var scope = {};

	var _planId;
	var _domain;
	var _version;

	scope.reservePlan = null;

	scope.init = _init;

	/**
	 * @description 초기화
	 * @param {String} planId 도면 id
	 * @param {String} domain 주소
	 * @param {String} version 버전
	 */
	function _init (planId, domain, version) {
		_planId = planId ? planId : {};
		_domain = domain ? domain : "";
		_version = version ? version : "/api/V2";

		initReservePlan(_planId, _domain, _version);
	}

	/**
	 * @description 예매 Api 초기화
	 * @param {String} _planId 도면 id
	 * @param {String} _domain 주소
	 * @param {String} _version 버전
	 */
	function initReservePlan (_planId, _domain, _version) {
		tk.api.reservePlan.init({
			domain: _domain,
			version: _version,
			scheduleId: _planId.reservePlan,
			prefix: "/plan",
			ajaxOptions: {
				contentType: "application/json;charset=UTF-8",
				dataType: 'json',
				crossDomain: true,
			}
		});
		scope.reservePlan = tk.api.reservePlan;
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 로딩 Utils
 * @external tk.utils
 */

tk.utils.createNamespace("tk.util.loading");
tk.util.loading = (function () {
	'use strict';

	var scope = {};
	var ready = false;

	// loading element
	var loadingElement = null;
	var body = $(document.body);
	var flag = false;

	var timeoutIds = []; // 로딩 종료 대기 리스트

	scope.init = _init;
	scope.start = _start;
	scope.stop = _stop;
	scope.loadingOn = _loadingOn;
	scope.loadingOff = _loadingOff;

	/**
	 * @description loading 초기화
	 * @param {Object} element 로딩할 element (선택)
	 */
	function _init (element) {
		if (element !== undefined) { // 입력 받은 element
			loadingElement = $(element);
			return;
		}

		if (tk.state.device && tk.state.device.isMobile()) { // mobile loading element
			loadingElement = $(
				'<div id="dimmed" class="dimmed"></div>'
			);
			return;
		}

		// PC loading element
		loadingElement = $(
			'<div id="dimmed" class="loading_layer" style="display: block; z-index: 999;">' +
			'<div class="loading"></div>' +
			'<div class="dimmed"></div>' +
			'</div>');
	}

	/**
	 * @description loading 시작
	 * @param {Number} time 로딩 최대 시간
	 * @param {Function} failedFunc 실패시 실행 함수
	 * @return {Number} 생성된 timeout id
	 */
	function _start (time, failedFunc) {
		time = Number(time) ? time : 1000 * 60;

		addLoadingElement();

		var timeoutId = setTimeout(function () {
			failedFunc();
			removeTimeoutId(timeoutId, failedFunc);
		}, time);
		timeoutIds.push(timeoutId);

		return timeoutId;
	}

	/**
	 * @description loading 종료
	 * @param {Number} timeoutId 종료할 timeout id
	 */
	function _stop (timeoutId) {
		clearTimeout(timeoutId);
		removeTimeoutId(timeoutId);
	}

	/**
	 * @description loading element 추가
	 */
	function addLoadingElement () {
		if (!isReady()) {
			_init();
		}

		if (timeoutIds.length > 0) { // 이미 실행 중인 로딩이 있을 경우 건너뜀
			return;
		}
		body.append(loadingElement);
	}

	/**
	 * @description loading element 제거
	 */
	function removeLoadingElement () {
		if (timeoutIds.length > 0) {
			return;
		}
		if (loadingElement) {
			loadingElement.remove();
		}
	}

	/**
	 * @description 로딩 종료 대기 리스트에서 timeout id 제거
	 * @param {Number} timeoutId 제거할 timeout id
	 */
	function removeTimeoutId (timeoutId) {
		var i = timeoutIds.indexOf(timeoutId);
		if (i >= 0) {
			timeoutIds.splice(i, 1);
			removeLoadingElement();
		}
	}

	/**
	 * @description loading on
	 */
	function _loadingOn () {
		if (flag) {
			return;
		}
		flag = true;

		if (window.tkLottie !== undefined) {
			tkLottie.isShowLoading(true);
		} else {
			addLoadingElement();
		}
	}

	/**
	 * @description loading off
	 */
	function _loadingOff () {
		flag = false;
		removeLoadingElement();
		if (window.tkLottie) {
			tkLottie.isShowLoading(false);
		}
	}

	/**
	 * @description 초기화 여부
	 */
	function isReady () {
		return ready;
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 예매 페이지 관련 유틸
 * @external tk.utils
 */

tk.utils.createNamespace("tk.util.reserve");
tk.util.reserve = (function () {
  "use strict";

  var scope = {};
  var meta = null;
  var partnerNo = null;

  scope.init = _init;
  scope.previousStep = _previousStep;
  scope.nextStep = _nextStep;
  scope.windowClose = _windowClose;
  scope.isMobile = _isMobile;
  scope.isAppWeb = _isAppWeb;
  scope.isFacility = _isFacility;
  scope.isGlobal = _isGlobal;
  scope.checkLoadPrevious = _checkLoadPrevious;
  scope.checkDevice = _checkDevice;

  /**
   * @description 초기화
   * @param {Object} metaData 메타 데이터
   * @param {Object} pN 파트너 넘버
   */
  function _init(metaData, pN) {
    meta = metaData;
    partnerNo = pN;
  }

  /**
   * @description 이전 단계
   */
  function _previousStep() {
    if (!meta) {
      return;
    }

    if (meta.isSports && !_isFacility()) {
      // 스포츠의 경우 웹 시설을 제외하고 날짜회차가 없어서 종료
      if (_isAppWeb()) {
        location.href = "ticketlink://closeWebView";
      } else {
        window.close();
      }
    } else if (meta.isSports && _isFacility()) {
      if (_isAppWeb()) {
        // 스포츠 앱 시설의 경우 날짜회차가 존재하지 않는다고 한다.
        location.href = "ticketlink://closeWebView";
      } else {
        if (meta.productTypeCode === "SEASON_TICKET_SEAT") {
          //시즌권인 경우 날짜/회차가 존재하지 않기 때문에 상품리스트 페이지로 보낸다(뒤로가기)
          location.href =
            "/product/list?partnerNo" + encodeURIComponent(partnerNo);
        } else {
          var homeTeamId = meta.schedule.vss[0].hoemTeamId;
          //시즌권이 아닌 경우 날짜/회차 페이지로 이동
          if (_isGlobal()) { // 시설 글로벌 일 때
            location.href = (
                "/global/en/reserve/product/" +
                meta.productId +
                "/schedule/sports?teamId=" +
                homeTeamId
            ).replace(/\s/gi, "");
          } else {
            location.href = (
                "/reserve/product/" +
                meta.productId +
                "/schedule/sports?teamId=" +
                homeTeamId
            ).replace(/\s/gi, "");
          }

        }
      }
    } else if (_isGlobal()) {
      location.href = (
        "/global/" +
        meta.locale +
        "/reserve/product/" +
        meta.productId
      ).replace(/\s/gi, "");
    } else {
      localStorage.setItem("selected_date", meta.schedule.date);
      localStorage.setItem("selected_scheduleId", meta.schedule.scheduleId);
      //공연 상품 날짜/회차 페이지로 이동
      location.href = (
        "/reserve/product/" +
        meta.productId +
        "/schedule"
      ).replace(/\s/gi, "");
    }
  }

  /**
   * @description 이후 단계
   * @param {String|Number} key 예매 키
   */
  function _nextStep(key) {
    if (!meta) {
      return;
    }

    var nextUrl = "https://" + tk.utils.parseUrl(location.href).host;

    if (_isGlobal()) {
      nextUrl += "/global/" + meta.locale + "/reserve/key/" + key + "/price";
    } else {
      nextUrl += "/reserve/key/" + key + "/price";
    }

    var param_mobile = _isMobile() ? "mobile" : "web";
    if (aceTraderScript) {
      aceTraderScript(meta.productId, 1, 1, param_mobile, "좌석등급선택", 1);
    }

    location.href = nextUrl;
  }

  /**
   * @description 팝업 종료
   */
  function _windowClose() {
    // FIXME KBL 종료후 삭제
    if (
      meta.kbl ||
      meta.wkbl ||
      meta.charlotte ||
      meta.tMonet ||
      meta.kleague ||
      meta.kovo
    ) {
      if (_isAppWeb()) {
        // 스포츠 앱 시설의 경우 날짜회차가 존재하지 않는다고 한다.
        location.href = "ticketlink://closeWebView";
      } else {
        // FIXME K-리그 임시 적용
        if (meta.kleague) {
          window.location = "https://www.kleague.com/schedule.do";
        } else {
          window.close();
        }
      }
      return;
    }

    if (_isFacility() && _isMobile()) {
      // 시설 모바일의 경우 예매하기를 누를 시 팝업으로 동작하지 않는다.
      // 팝업이 아니기 떄문에 window.close 는 작동하지 않으며, 최초화면으로 돌아가야한다.
      if (meta.isSports) {
        // 스포츠일 경우
        if (_isAppWeb()) {
          // 스포츠 앱 시설의 경우 날짜회차가 존재하지 않는다고 한다.
          location.href = "ticketlink://closeWebView";
        } else {
          // 모바일 - 타 구단(시설)에서 원하는대로 버튼 동작이 필요할 때, (공통)
          var clossPass = btn.control.closeForFacility(meta.cssSuffix);

          if (!clossPass) {
            if (_isGlobal()) { // 시설 글로벌 일 때
              location.href = "/global/en/product/list?partnerNo" + encodeURIComponent(partnerNo);
            } else {
              location.href = "/product/list?partnerNo" + encodeURIComponent(partnerNo);
            }
          }
        }
      } else {
        //공연 상품 날짜/회차 페이지로 이동
        location.href = "/product/list?partnerNo" + encodeURIComponent(partnerNo);
      }
    } else {
      if (_isAppWeb()) {
        // 스포츠 앱 시설의 경우 날짜회차가 존재하지 않는다고 한다.
        location.href = "ticketlink://closeWebView";
      } else {
        tk.utils.windowClose();
      }
    }
  }

  /**
   * @description 모바일 여부
   * @return {Boolean} 모바일 여부
   */
  function _isMobile() {
    var hostName = window.location.hostname.split(/[.-]/);

    return !!_.find(hostName, function (name) {
      return name === "m";
    });
  }

  /**
   * @description 웹뷰 여부
   * @return {Boolean} 웹뷰 여부
   */
  function _isAppWeb() {
    var hostName = window.location.hostname.split(/[.-]/);

    return !!_.find(hostName, function (name) {
      return name === "appweb";
    });
  }

  /**
   * @description 시설 여부
   * @return {Boolean} 시설 여부
   */
  function _isFacility() {
    var hostName = window.location.hostname.split(/[.-]/);

    return !!_.find(hostName, function (name) {
      return name === "facility";
    });
  }

  /**
   * @description 글로벌 여부
   * @return {Boolean} 글로벌 여부
   */
  function _isGlobal() {
    var hostName = window.location.pathname.split("/");
    var result = false;

    _.each(hostName, function (name, idx) {
      if (name === "global") {
        meta.locale = hostName[idx + 1];
        result = true;
      }
    });
    return result;
  }

  /**
   * @description 이전단계 초기화 체크해서 리프레시
   */
  function _checkLoadPrevious() {
    var parsedUrl = tk.utils.parseUrl(location.href);
    if (
      !parsedUrl.queryKey.hasOwnProperty("loadPrevious") ||
      parsedUrl.queryKey.loadPrevious !== "false"
    ) {
      return;
    }
    location.href =
      location.protocol + "//" + location.host + location.pathname;
  }

  /**
   * @description 단말기 지원 여부 확인
   */
  function _checkDevice() {
    // debugModernizr(); // 지원하는 단말기인지 확인을 위한 처리
    var isAvailableCanvas =
      Modernizr.canvas && Modernizr.canvastext && Modernizr.canvaswinding;
    if (isAvailableCanvas) {
      return;
    }
    noticeNotAvailableDevice();
  }

  /**
   * @description 단말기 지원을 안할시 알림
   */
  function noticeNotAvailableDevice() {
    if (!meta) {
      return;
    }

    if (meta.isSports) {
      // 스포츠의 경우 웹 시설을 제외하고 날짜회차가 없어서 종료
      alert("지원하지 않는 단말기입니다. PC웹으로 진행 해주세요.");
    } else {
      alert("지원하지 않는 단말기입니다. PC웹 또는 크롬으로 진행 해주세요.");
    }

    if (_isAppWeb()) {
      location.href = "ticketlink://closeWebView";
    } else {
      window.close();
    }
  }

  function debugModernizr() {
    var div = document.createElement("div");
    var modernizrContent = "";

    _.each(Modernizr, function (val, key) {
      modernizrContent += "key : " + key + ", val : " + val + "\n";
    });

    div.innerText = modernizrContent;
    div.style.zIndex = 400;
    div.style.position = "absolute";
    div.style.textAlign = "center";
    div.style.top = "300px";
    div.style.width = "100%";
    div.style.backgroundColor = "#FFFFFF";
    document.body.appendChild(div);
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc 전역 state
 * @external tk.utils, tk.util.reserve, tk.state.device, tk.state.develop, tk.i18n.translate, tk.state.plan, tk.event.service
 */

tk.utils.createNamespace("tk.state.global");
tk.state.global = (function () {
  "use strict";

  var scope = {};

  scope.product = null;
  scope.meta = null;
  scope.grades = null;
  scope.globalLocale = null;
  scope.imgUrl = null;
  scope.device = null;
  scope.phase = null;

  scope.init = _init;

  scope.ready = _ready;
  scope.waitingInit = _waitingInit;

  /**
   * @description 글로벌 초기화
   * @param {Object} product 상품
   * @param {Object} meta 메타 데이터
   * @param {Object} grades 등급
   * @param {String} globalLocale 글로벌 언어
   * @param {String} imgUrl 이미지 URL
   * @param {String} device 디바이스
   * @param {String} phase Phase
   * @param {Object} partnerNo 파트너 넘버
   * @param {Object} waitingDetail 대기 상세정보
   */
  function _init(
    product,
    meta,
    grades,
    globalLocale,
    imgUrl,
    device,
    phase,
    partnerNo,
    waitingDetail
  ) {
    if (meta === undefined) {
      alert("기본 도면 정보를 받을 수 없습니다.");
    }

    if (grades === undefined) {
      alert("기본 등급 정보를 받을 수 없습니다.");
    }

    scope.product = product;
    scope.meta = meta;
    scope.grades = grades;
    scope.globalLocale = globalLocale;
    scope.imgUrl = imgUrl;
    scope.device = device;
    scope.phase = phase;
    scope.partnerNo = partnerNo;

    // 글로벌에 따른 Api 처리
    // alert(scope.device);
    // if (scope.device === 'global_web') {
    if (globalLocale !== "ko") {
      tk.apis.init(
        { reservePlan: initData.meta.schedule.scheduleId },
        "",
        `/global/${globalLocale}/api/V2`
      );
    } else {
      var scheduleId = "0000";
      if (scope.meta.schedule) {
        scheduleId = scope.meta.schedule.scheduleId;
      }
      tk.apis.init({ reservePlan: scheduleId });
    }

    // 기본 초기화
    tk.util.reserve.init(scope.meta, scope.partnerNo);
    tk.state.device.init(scope.device);
    tk.state.develop.init(scope.phase);
    tk.i18n.translate.init(scope.globalLocale);
    tk.state.plan.init(scope.meta, scope.grades, scope.product);
    if (
      tk.utils.isWaitingReservation() &&
      meta.frontPlanTypeCode === "WAITING_APPLICATION"
    ) {
      tk.state.waitingDetail.init(waitingDetail);
    }

    tk.controller.view.init();
    initGlobalEvent();
  }

  /**
   * @description 글로벌 초기화
   * @param {Object} product 상품
   * @param {Object} meta 메타 데이터
   * @param {Object} grades 등급
   * @param {String} globalLocale 글로벌 언어
   * @param {String} imgUrl 이미지 URL
   * @param {String} device 디바이스
   * @param {String} phase Phase
   * @param {Object} partnerNo 파트너 넘버
   * @param {Object} waitingDetail 대기 상세정보
   */
  function _ready(
    product,
    meta,
    grades,
    globalLocale,
    imgUrl,
    device,
    phase,
    partnerNo,
    waitingDetail
  ) {
    scope.product = product;
    scope.meta = meta;
    scope.grades = grades;
    scope.globalLocale = globalLocale;
    scope.imgUrl = imgUrl;
    scope.device = device;
    scope.phase = phase;
    scope.partnerNo = partnerNo;

    var scheduleId = "0000";
    if (scope.meta.schedule) {
      scheduleId = scope.meta.schedule.scheduleId;
    }
    tk.apis.init({ reservePlan: scheduleId });
    tk.util.reserve.init(scope.meta, scope.partnerNo);
    tk.i18n.translate.init(scope.globalLocale);
    tk.state.device.init(scope.device);
    tk.state.develop.init(scope.phase);
    tk.state.plan.init(scope.meta, scope.grades, scope.product);
    if (
      tk.utils.isWaitingReservation() &&
      meta.frontPlanTypeCode === "WAITING_APPLICATION"
    ) {
      tk.state.waitingDetail.init(waitingDetail);
    }
  }

  function _waitingInit() {
    tk.controller.view.init();
    initGlobalEvent();
  }

  /**
   * @description 글로벌 이벤트 초기화
   */
  function initGlobalEvent() {
    // 우클릭 방지
    document.oncontextmenu = function () {
      return false;
    };

    // 드래그 방지
    document.onselectstart = function () {
      return false;
    };
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc device state
 * @external tk.utils
 */

tk.utils.createNamespace("tk.state.device");
tk.state.device = (function () {
	'use strict';

	var scope = {};

	/**
	 * 디바이스 타입
	 */
	scope.DEVICE_TYPE = {
		PC_WEB: {
			type: 'pc_web',
			template: ''
		},
		GLOBAL_WEB: {
			type: 'global_web',
			template: '-global'
		},
		GLOBAL_MOBILE_WEB: {
			type: 'global_mobile_web',
			template: '-global'
		},
		MOBILE_WEB: {
			type: 'mobile_web',
			template: '-mobile'
		},
		MOBILE_APP: {
			type: 'mobile_app',
			template: '-mobile'
		}
	};

	scope.deviceType = scope.DEVICE_TYPE.PC_WEB; // 디바이스 타입
	scope.isIOS = tk.utils.isIOS(); // iOS 여부
	scope.isAOS = /android/.test(window.navigator.userAgent.toLowerCase());
	scope.previousTouchTarget = null;
	scope.version = _getVersion();

	scope.init = _init;
	scope.getBrowser = _getBrowser;
	scope.getTemplateOfDevice = _getTemplateOfDevice;
	scope.isPc = _isPc;
	scope.isMobile = _isMobile;
	scope.isApp = _isApp;
	scope.isIOSMobileApp = _isIOSMobileApp;
	scope.isAOSSamsungMobileApp = _isAOSSamsungMobileApp;
	scope.isAOSLGMobileApp = _isAOSLGMobileApp;
	scope.isMobileDevice = _isMobileDevice;
	scope.isGlobal = _isGlobal;

	/**
	 * @description 디바이스 초기화
	 * @param {String} device 디바이스
	 */
	function _init (device) {
		var type = _.find(scope.DEVICE_TYPE, function (type) {
			return device === type.type;
		});
		if (type) {
			scope.deviceType = type;
		}
	}

	/**
	 * @description 브라우저 정보 반환
	 * @return {String} 브라우저 정보
	 */
	function _getBrowser () {
		var userAgent = window.navigator.userAgent;

		var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};
		for (var key in browsers) {
			if (browsers[key].test(userAgent)) {
				return key;
			}
		}
		return 'unknown';
	}

	/**
	 * @description 디바이스에 따른 template 반환
	 * @return {String} 디바이스에 따른 template
	 */
	function _getTemplateOfDevice () {
		return scope.deviceType.template;
	}

	function _isPc () {
		return scope.deviceType === scope.DEVICE_TYPE.PC_WEB || scope.deviceType === scope.DEVICE_TYPE.GLOBAL_WEB;
	}

	function _isMobile () {
		return scope.deviceType === scope.DEVICE_TYPE.MOBILE_WEB ||
			scope.deviceType === scope.DEVICE_TYPE.MOBILE_APP;
	}

	function _isApp () {
		return scope.deviceType === scope.DEVICE_TYPE.MOBILE_APP;
	}

	/**
	 * @description iOS 웹뷰 여부 반환
	 * @return {Boolean} iOS 웹뷰 여부
	 */
	function _isIOSMobileApp () {
		return tk.utils.isIOSMobileApp();
	}

	/**
	 * @description AOS Samsung 웹뷰 여부 반환
	 * @return {Boolean} AOS Samsung 웹뷰 여부
	 */
	function _isAOSSamsungMobileApp () {
		return tk.utils.isAOSSamsungMobileApp();
	}

	/**
	 * @description AOS Samsung 웹뷰 여부 반환
	 * @return {Boolean} AOS Samsung 웹뷰 여부
	 */
	function _isAOSLGMobileApp () {
		return tk.utils.isAOSLGMobileApp();
	}

	/**
	 * @description 모바일기기 여부 반환
	 * @return {Boolean} 모바일기기 여부
	 */
	function _isMobileDevice () {
		return scope.isIOS || scope.isAOS;
	}

	/**
	 * @description 글로벌 여부 반환
	 * @return {Boolean} iOS 웹뷰 여부
	 */
	function _isGlobal () {
		return scope.deviceType === scope.DEVICE_TYPE.GLOBAL_WEB;
	}

	/**
	 * @description 디바이스 OS 버전 반환
	 * @return {Array} 디바이스 OS 버전
	 */
	function _getVersion () {
		var match = window.navigator.userAgent.match(/OS ((\d+_?){2,3})\s/);

		if (!match) {
			return null;
		}

		return match[1].split('_');
	}

	return scope;
})();

/**
 * @author donghyun seo
 * @desc 개발 state
 * @external tk.utils
 */

tk.utils.createNamespace("tk.state.develop");
tk.state.develop = (function () {
	'use strict';

	var scope = {};

	/**
	 * 테스트 모드
	 * 0 : 원본
	 */
	var testMode = 0; // 테스트 모드

	var debugMode = false; // 디버그 모드 사용 여부
	var debugModeOn = false; // 디버그 모드 여부
	var performanceMode = false; // 성능 모드 사용 여부

	var PHASE = {
		LOCAL: "local",
		ALPHA: "alpha",
		BETA: "beta",
		RELEASE: "release"
	};

	scope.DEBUG_TIME_TYPE = {
		NORMAL: {
			enable: false
		},
		DATA: {
			enable: false
		},
		UI: {
			enable: false
		},
		API: {
			enable: false
		},
		STATE: {
			enable: false
		}
	};

	scope.init = _init;
	scope.getTestMode = _getTestMode;
	scope.getDebugMode = _getDebugMode;
	scope.getDebugModeOn = _getDebugModeOn;
	scope.toggleDebugModeOn = _toggleDebugModeOn;
	scope.getPerformanceMode = _getPerformanceMode;

	scope.debugTimeStart = _debugTimeStart;
	scope.debugTimeEnd = _debugTimeEnd;
	scope.debugTimeEndByPromise = _debugTimeEndByPromise;

	/**
	 * @description develop 초기화
	 * @return {String} phase Phase
	 */
	function _init (phase) {
		switch (phase) {
			case PHASE.LOCAL:
				debugMode = true;
				break;
			case PHASE.ALPHA:
				debugMode = true;
				break;
			case PHASE.BETA:
				debugMode = false;
				break;
			case PHASE.RELEASE:
				debugMode = false;
				break;
			default:
				debugMode = false;
		}
	}

	/**
	 * @description 테스트 모드 타입 반환
	 * @return {Number} 테스트 모드 타입
	 */
	function _getTestMode () {
		return testMode;
	}

	/**
	 * @description 디버그 모드 사용 여부 반환
	 * @return {Boolean} 디버그 모드 사용 여부
	 */
	function _getDebugMode () {
		return debugMode;
	}

	/**
	 * @description 디버그 모드 여부 반환
	 * @return {Boolean} 디버그 모드 여부
	 */
	function _getDebugModeOn () {
		return debugMode && debugModeOn;
	}

	/**
	 * @description 디버그 모드 여부 토글
	 */
	function _toggleDebugModeOn () {
		debugModeOn = !debugModeOn;
	}

	/**
	 * @description 성능 모드 사용 여부 반환
	 * @return {Boolean} 성능 모드 사용 여부
	 */
	function _getPerformanceMode () {
		return performanceMode;
	}

	/**
	 * @description 디버그 모드일시 console.time 시작
	 * @param {Object} debugTimeType 디버그 타입
	 * @param {String} label 기록할 라벨
	 */
	function _debugTimeStart (debugTimeType, label) {
		if (!_getDebugMode() || !debugTimeType.enable) {
			return;
		}
		console.time(label);
	}

	/**
	 * @description 디버그 모드일시 console.time 종료
	 * @param {Object} debugTimeType 디버그 타입
	 * @param {String} label 기록할 라벨
	 */
	function _debugTimeEnd (debugTimeType, label) {
		if (!_getDebugMode() || !debugTimeType.enable) {
			return;
		}
		console.timeEnd(label);
	}

	/**
	 * @description 디버그 모드일시 console.time 종료
	 * @param {Object} debugTimeType 디버그 타입
	 * @param {String} label 기록할 라벨
	 * @param {Object} promise Promise 객체
	 */
	function _debugTimeEndByPromise (debugTimeType, label, promise) {
		if (!_getDebugMode() || !debugTimeType.enable) {
			return;
		}
		promise.done(function () {
			console.timeEnd(label);
		}).fail(function () {
			console.timeEnd(label);
		});
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 도면 state
 * @external tk.utils, tk.util.canvas, tk.event.service, tk.state.device, tk.state.develop
 */

tk.utils.createNamespace("tk.state.plan");
tk.state.plan = (function () {
  "use strict";

  var scope = {};
  var ready = false;

  // 기본 메타 정보
  scope.productName = null; // 상품 이름
  scope.placeName = null; // 장소 이름
  scope.physical = null; // 물리 도면 정보
  scope.logical = null; // 논리 도면 정보
  scope.schedule = null; // 스케쥴
  scope.isSports = false; // 스포츠 여부
  scope.isRemainExposure = true; // 남은 좌석 노출 여부
  scope.isPriceExposure = true; // 가격 노출 여부
  scope.reserveCommissionContent = null; // 예매 안내
  scope.isPreSale = null; //선예매 여부
  scope.frontPlanTypeCode = "NONE"; // 예매대기 상태정보
  scope.isWaitingReservationAvail = false; // 예매대기신청 가능 여부
  scope.scheduleWaitingReservation = {}; // 예매대기 신청일자 정보
  scope.isCoupang = false;
  scope.seatScheduleChangeUseYn = false;

  // Flag 정보
  scope.canUpdateRemainInfo = true; // 잔여석에 따른 좌석 업데이트 flag

  // 매수제어
  scope.limitTotalCount = 0; // 전체 구매가능 매수
  scope.limitGradeMap = {}; // 등급당 구매가능 매수
  scope.exceptionalLimitGradeMap = {}; // 예외 처리된 등급단 구매가능 매수
  scope.gradeCountLimitTypeMap = {}; // 등급별 구매가능 매수 타입

  // 물리도면 정보
  scope.physicalPlan = null; // 물리도면 정보
  scope.bgInfo = null; // 배경 정보
  scope.mapSize = 0; // 도면 크기
  scope.bgImageTileSize = 0; // 도면 타일 크기
  scope.bgImageTileUrl = null; // 도면 타일 주소
  scope.pagingInfo = []; // 페이징 정보
  scope.blockInfo = []; // 영역 정보
  scope.zoneInfo = []; // 비지정 정보
  scope.planExposure = true; // 전체화면 여부
  scope.minimapExposure = false; // 미니맵 노출 여부

  // 영역 정보
  scope.hasArea = false; // 영역 사용 여부
  scope.areaBgInfo = null; // 영역 정보
  scope.areaImageUrlThumnail = null; // 영역 이미지 섬네일
  scope.areaImageSize = 0; // 영역 이미지 크기

  // 등급 정보
  scope.gradeInfo = []; // 등급
  scope.gradeMap = {}; // 등급 맵
  scope.gradeAgreeMap = []; // 등급 동의 맵
  scope.blockInGradeMap = {}; // 등급 내 영역 맵

  // 영역 정보
  scope.blockMap = {}; // 영역 맵
  scope.blockRowColMap = {}; // 영역 내 로우콜 맵
  scope.blockLinkedMap = {}; // 영역 내 연석 맵
  scope.blockWaitingLinkedMap = {}; // 영역 내 예매대기 연석 맵
  scope.blockGroupMap = {}; // 영역 내 묶음좌석 맵
  scope.blockSeatMap = {}; // 영역 내 좌석 맵
  scope.blockZoneMap = {}; // 영역 내 비지정 맵
  scope.blockSectorMap = {}; // 영역 페이징 내 좌석 맵
  scope.gradeInBlockMap = {}; // 영역 내 등급 맵

  // 페이징 정보
  scope.pagingBoolMap = {}; // 페이징 불 맵
  scope.pagingCallMap = {}; // 페이징 호출 맵
  scope.blockCallMap = {}; // 섹터 호출 맵
  scope.pagingLoadCanvasMap = {}; // 페이징 로드 영역 맵
  scope.pagingLoadSoldoutMap = {}; // 페이징 로드 좌석 맵
  scope.blockLoadCanvasMap = {}; // 영역 로드 영역 맵
  scope.blockLoadSoldoutMap = {}; // 영역 로드 좌석 맵
  scope.pagingMap = {}; // 패이징 맵

  // 좌석 정보
  scope.seatMap = {}; // 좌석 맵
  scope.seatSoldMap = {}; // 좌석 판매여부 맵

  // 비지정 정보
  scope.zoneMap = {}; // 비지정 맵
  scope.zoneSoldMap = {}; // 비지정 남은좌석 맵
  scope.zoneWaitMap = {}; // [예매대기전용] 비지정석 대기자 맵

  // 구역 정보
  scope.sectionInfo = []; // [예매대기전용] 구역정보
  scope.sectionMap = {}; // [예매대기전용] 구역정보
  scope.sectionInBlocks = []; // [예매대기전용] 구역이 가진 section

  // 이미지
  scope.defaultThumnailSize = 160; // 기본 섬네일 크기
  scope.seatGridTileSize = 256; // 그리드 타일 크기

  /**
   * 좌석 선택 타입
   * 0 : 자동 배정 + 직접 선택
   * 1 : 자동 선택
   * 2 : 직접 선택
   */
  scope.SELECT_TYPE = {
    AUTO_DIRECT: 0,
    AUTO: 1,
    DIRECT: 2,
  };
  scope.selectType = scope.SELECT_TYPE.DIRECT; // 좌석 선택 타입

  /**
   * 좌석 노출 타입
   * 0 : 전체 노출
   * 1 : 부분 노출
   */
  scope.EXPOSURE_TYPE = {
    WHORE: 0,
    PART: 1,
  };

  scope.exposureType = scope.EXPOSURE_TYPE.WHORE; // 좌석 노출 타입

  /* API 최적화를 위한 상태값 */
  scope.isApiLoadRequire = {
    grade: false,
  };

  scope.isReady = _isReady;
  scope.init = _init;
  scope.getGrades = _getGrades;
  scope.setGrades = _setGrades;
  scope.gradeSort = _gradeSort;
  scope.getBlocksInGradeByGradeId = _getBlocksInGradeByGradeId;
  scope.getGradesInBlockByBlockId = _getGradesInBlockByBlockId;
  scope.getGradeRemainCntAboutBlockAndGrade =
    getGradeRemainCntAboutBlockAndGrade;
  scope.setGradesInBlock = _setGradesInBlock;
  scope.setZoneSoldMap = _setZoneSoldMap;
  scope.setSeats = _setSeats;
  scope.restoreSeatSoldMap = _restoreSeatSoldMap;
  scope.filteredSeatSoldMap = _filteredSeatSoldMap;
  scope.setSeatSoldMap = _setSeatSoldMap;
  scope.setBlockRowColBySeat = _setBlockRowColBySeat;
  scope.setBlockLinkedBySeat = _setBlockLinkedBySeat;
  scope.setBlockGroupBySeat = _setBlockGroupBySeat;
  scope.setWaitingLinkedBySeat = _setWaitingLinkedBySeat;
  // scope.checkWaitingLinkedBySeat = _checkWaitingLinkedBySeat;
  scope.setLimit = _setLimit;
  scope.getMapSizeOfLevel = _getMapSizeOfLevel;
  scope.getBgImageThumnail = _getBgImageThumnail;
  scope.getAreaImageThumnail = _getAreaImageThumnail;
  scope.isDirectSelect = _isDirectSelect;
  scope.isPartExposure = _isPartExposure;
  scope.isNeedToPagingCall = _isNeedToPagingCall;
  scope.reservationWaitingRelease = _reservationWaitingRelease;
  scope.release = _release;

  /**
   * @description 초기화 여부 반환
   * @return {Boolean} 초기화 여부
   */
  function _isReady() {
    return ready;
  }

  /**
   * @description 초기화
   * @param {Object} meta 메타 데이터
   * @param {Object} grades 등급 정보
   * @param {Object} product 상품 정보
   */
  function _init(meta, grades, product) {
    if (!meta) {
      return;
    }
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.STATE,
      "Init Plan State"
    );

    scope.productId = meta.productId;
    scope.productName = meta.productName;
    scope.productNameEng = meta.productNameEng;
    scope.isSports = meta.isSports;
    // 스포츠상품 ; 장소 노출, 공연 상품 ; 홀 노출
    if (meta.isSports) {
      scope.placeName = meta.placeName;
      scope.placeNameEng = meta.placeNameEng;
    } else {
      scope.placeName = product.hallName;
      scope.placeNameEng = product.hallNameEng;
    }
    scope.isKbl = meta.kbl; // >> meta.cssSuffix;
    scope.isWkbl = meta.wkbl; // >> meta.cssSuffix;
    scope.isKleague = meta.kleague; // >> meta.cssSuffix;
    scope.isCoupang = meta.coupang; // >> meta.cssSuffix;
    scope.isKovo = meta.cssSuffix === '_kovo';
    scope.cssSuffix = meta.cssSuffix;
    scope.seatScheduleChangeUseYn = meta.seatScheduleChangeUseYn;
    scope.physical = meta.draw.physical;
    scope.logical = meta.draw.logical;
    scope.schedule = meta.schedule;
    scope.isRemainExposure = meta.isRemainExposure;
    scope.isPriceExposure = meta.isPriceExposure;
    scope.reserveCommissionContent = meta.reserveCommissionContent;
    scope.frontPlanTypeCode = meta.frontPlanTypeCode;
    scope.isWaitingReservationAvail = meta.isWaitingReservationAvail;
    if (
      meta.scheduleWaitingReservation &&
      meta.scheduleWaitingReservation.hasOwnProperty("saleStatus")
    ) {
      scope.scheduleWaitingReservation = {
        parsedSaleStartDate: tk.utils.momentFormat(
          meta.scheduleWaitingReservation.saleStartDatetime,
          DATE_FORMAT.IN_SALE
        ),
        parsedSaleEndDate: tk.utils.momentFormat(
          meta.scheduleWaitingReservation.saleEndDatetime,
          DATE_FORMAT.IN_SALE
        ),
        saleStatus: meta.scheduleWaitingReservation.saleStatus,
      };
    }

    // if (!tk.utils.isWaitingReservation()) {
    //   scope.canUpdateRemainInfo = grades.every(function (grade) {
    //     return grade.remainCnt !== 0;
    //   });
    // }

    _setLimit(meta.limit);

    scope.physicalPlan = scope.physical.physicalPlan;
    scope.bgInfo = scope.physical.bgInfo;
    scope.mapSize = scope.bgInfo.mapSize;
    scope.bgImageTileSize = scope.bgInfo.imageTileSize;
    scope.bgImageTileUrl = scope.bgInfo.imageTileUrl;
    scope.bgImageUrlThumnail = reformatUrl(scope.bgInfo.imageUrlThumnail);

    scope.planExposure = scope.physicalPlan.planExposure;
    if (!scope.planExposure) {
      scope.exposureType = scope.EXPOSURE_TYPE.PART;
    } else {
      scope.exposureType = scope.EXPOSURE_TYPE.WHORE;
    }
    scope.minimapExposure = scope.physicalPlan.minimapExposure;

    scope.pagingInfo = scope.physical.pagingInfo;

    initPagingInfo(scope.pagingInfo);

    scope.zoneInfo = meta.draw.zoneInfo;
    _.each(scope.zoneInfo, function (zone) {
      zone.count = 0;
      scope.zoneMap[zone.logicalZoneId] = zone;
    });

    scope.hasArea = scope.physicalPlan.blockPhysicalPlan;
    scope.areaBgInfo = scope.physical.blockBgInfo;
    if (scope.hasArea) {
      var mapSize = tk.state.device.isMobile() ? 1024 : 2048;
      scope.areaImageSize =
        scope.areaBgInfo.mapSize < mapSize ? scope.areaBgInfo.mapSize : mapSize;
      scope.areaImageUrlThumnail = reformatUrl(
        scope.areaBgInfo.imageUrlThumnail
      );
      scope.blockInfo = meta.draw.blockInfo;

      _.each(scope.blockInfo, function (block) {
        scope.blockMap[block.blockId] = block;
        scope.blockSectorMap[block.blockId] = {};
      });
    }

    setBlockZoneMap();

    scope.autoSelect = scope.logical.autoSelect;
    if (grades !== undefined) {
      _setGrades(grades);
    }
    if (meta.draw.sectionInfo !== undefined) {
      _setSections(meta.draw.sectionInfo);
    }
    ready = true;

    scope.isOnlyAutoAssignment = false;

    for (var i = 0; i < scope.gradeInfo.length; i++) {
      var grade = scope.gradeInfo[i];
      if (grade.auto == true && grade.direct == false) {
        scope.isOnlyAutoAssignment = true;
      } else {
        scope.isOnlyAutoAssignment = false;
        return;
      }
    }

    tk.state.develop.debugTimeEnd(
      tk.state.develop.DEBUG_TIME_TYPE.STATE,
      "Init Plan State"
    );
  }

  function initPagingInfo(pagingInfo) {
    if (Array.isArray(pagingInfo)) {
      _.each(pagingInfo, function (paging) {
        scope.pagingBoolMap[paging.virtualX + ":" + paging.virtualY] = true;
        scope.pagingCallMap[paging.virtualX + ":" + paging.virtualY] = false;
        scope.pagingLoadCanvasMap[
          paging.virtualX + ":" + paging.virtualY
        ] = false;
        scope.pagingLoadSoldoutMap[
          paging.virtualX + ":" + paging.virtualY
        ] = false;
      });
    }
  }

  /**
   * @description 등급 정보 반환
   * @return {Array} 등급 정보
   */
  function _getGrades() {
    scope.gradeInfo.forEach(function (grade) {
      grade.isOnlyAutoAssignment = scope.isOnlyAutoAssignment;
    });
    return scope.gradeInfo;
  }

  /**
   * @description 등급 정보 설정
   * @param {Array} grades 등급 정보 설정
   * @return {Boolean} 설정 성공 여부
   */
  function _setGrades(grades) {
    if (!Array.isArray(grades)) {
      return false;
    }
    var isAllDirectSelect = true;
    var isAllAutoSelect = true;
    var isSomeDirectSelect = false;
    var isSomeAutoSelect = false;

    scope.gradeInfo = _gradeSort(grades);

    scope.gradeMap = {};

    var selectedGrade = tk.state.select.selectedGrade;

    // 등급내 우선 순위로 정렬이 아닌 nTas 정렬 순서를 유지하기 위한 처리
    _.each(scope.gradeInfo, function (grade) {
      var prevGradeAgree = scope.gradeAgreeMap[grade.gradeId];
      var hasPrevIsAgree = "undefined" !== typeof prevGradeAgree;

      scope.gradeMap[grade.gradeId] = grade;

      try {
        scope.gradeMap[grade.gradeId].seatColor = getRandomSimilarColor(scope.gradeMap[grade.gradeId].color);
      } catch (e) {}

      scope.gradeAgreeMap[grade.gradeId] = {
        hasContext: !!grade.agreeContext,
        isAgree: hasPrevIsAgree ? prevGradeAgree.isAgree : false,
        agreeContext: grade.agreeContext,
        confirmIdx: 0,
      };

      // 직접선택 여부
      if (grade.direct) {
        isSomeDirectSelect = true;
        isAllAutoSelect = false;
      }

      // 자동선택 여부
      if (grade.auto) {
        isSomeAutoSelect = true;
        isAllDirectSelect = false;
      }

      if (grade.preReserveSale) {
        //선예매 가능등급과 불가능 등급을 동시에 내려주지 않는다
        scope.isPreSale = true;
      }

      if (selectedGrade !== null && selectedGrade.gradeId === grade.gradeId) {
        tk.event.ui.signals.updatePopupData.dispatch(grade);
      }
    });

    if (!tk.utils.isWaitingReservation()) {
      // 새로고침 유무 상태값 수정
      scope.canUpdateRemainInfo = scope.gradeInfo.every(function (grade) {
        return grade.remainCnt !== 0;
      });
    }

    // 기본 선택 유형 설정
    if (isAllAutoSelect && !isSomeDirectSelect) {
      scope.selectType = scope.SELECT_TYPE.AUTO;
    } else if (isAllDirectSelect && !isSomeAutoSelect) {
      scope.selectType = scope.SELECT_TYPE.DIRECT;
    } else {
      scope.selectType = scope.SELECT_TYPE.AUTO_DIRECT;
    }

    return true;
  }

  /**
   * @description 랜덤 색 설정
   * @param {String} rgb(0, 0, 0) or #000000
   * @return {String} rgb(0, 0, 0) or #000000
   */
  function getRandomSimilarColor(color) {
    const variance = 10;
    let format = 'hex'; // 기본 색상 형식 설정
    let r, g, b;

    if (color.startsWith('#')) {
      r = parseInt(color.substring(1, 3), 16);
      g = parseInt(color.substring(3, 5), 16);
      b = parseInt(color.substring(5, 7), 16);
    } else if (color.startsWith('rgb')) {
      format = 'rgb';
      [r, g, b] = color.match(/\d+/g).map(Number);
    } else {
      return null;
    }

    r = Math.max(0, Math.min(255, r + Math.floor(Math.random() * (2 * variance + 1)) - variance));
    g = Math.max(0, Math.min(255, g + Math.floor(Math.random() * (2 * variance + 1)) - variance));
    b = Math.max(0, Math.min(255, b + Math.floor(Math.random() * (2 * variance + 1)) - variance));

    if (format === 'hex') {
      return "#" + r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
    } else {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  /**
   * @description 영역 정보 설정
   * @param {Array} section 영역 정보 설정
   * @return {Boolean} 설정 성공 여부
   */
  function _setSections(sections) {
    if (!Array.isArray(sections)) {
      return false;
    }

    scope.sectionInfo = sections;
    scope.sectionMap = {};

    _.each(sections, function (section) {
      var id = section.sectionId;
      scope.sectionMap[id] = {
        grades: section.grades.map(function (grade) {
          return grade.productGradeId;
        }),
        sectionName: section.sectionName,
      };
    });

    return true;
  }

  /**
   * @description 등급 정렬
   * @param {Object} grades 등급 정보
   * @param {Boolean} isByGradeId 등급 id로 정렬여부
   * @return {Array} 정렬된 등급
   */
  function _gradeSort(grades, isByGradeId) {
    if (!Array.isArray(grades)) {
      return [];
    }

    isByGradeId = isByGradeId === undefined ? false : isByGradeId;

    var sort = !isByGradeId ? compareForSort : compareForSortByGradeId;

    return grades.sort(sort);

    function compareForSort(first, second) {
      // 우선순위 순 정렬
      if (first.priority === second.priority) {
        // 이름 순 정렬
        if (first.name < second.name) return -1;
        if (second.name < first.name) return 1;
        return 0;
      } else if (first.priority < second.priority) {
        return -1;
      } else {
        return 1;
      }
    }

    function compareForSortByGradeId(first, second) {
      // 우선순위 순 정렬
      var firstGrade = scope.gradeMap[first.gradeId];
      var secondGrade = scope.gradeMap[second.gradeId];

      if (firstGrade === undefined) {
        return -1;
      }

      if (secondGrade === undefined) {
        return 1;
      }

      if (firstGrade.priority === secondGrade.priority) {
        // 이름 순 정렬
        if (firstGrade.name < secondGrade.name) return -1;
        if (secondGrade.name < firstGrade.name) return 1;
        return 0;
      } else if (firstGrade.priority < secondGrade.priority) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  /**
   * @description 해당 등급 내 영역 정보 반환
   * @param {Number} gradeId 영역 정보를 가져올 등급 id
   * @return {Array} 영역 정보
   */
  function _getBlocksInGradeByGradeId(gradeId) {
    if (!scope.blockInGradeMap[gradeId]) {
      return [];
    }

    var blockMap = scope.blockMap;
    return _.sortBy(scope.blockInGradeMap[gradeId], function (val) {
      if (blockMap.hasOwnProperty(val.blockId)) {
        return blockMap[val.blockId].blockName;
      }
    });
  }

  /**
   * @description 해당 영역 내 등급 정보 반환
   * @param {Number} blockId 등급 정보를 가져올 영역 id
   * @return {Array} 등급 정보
   */
  function _getGradesInBlockByBlockId(blockId) {
    if (!scope.gradeInBlockMap[blockId]) {
      return [];
    }
    return scope.gradeInBlockMap[blockId];
  }

  /**
   * @description 영역내 등급에 대한 등급의 남은 좌석 수 반환
   * @param {Object} block 영역
   * @param {Object} grade 등급
   * @return {Number} 영역내 등급에 대한 등급의 남은 좌석 수
   */
  function getGradeRemainCntAboutBlockAndGrade(block, grade) {
    var grades = scope.gradeInBlockMap[block.blockId];
    if (block === undefined || grade === undefined || !Array.isArray(grades)) {
      return [null, null];
    }

    var selectedGrade = _.find(grades, function (gradeInBlock) {
      return gradeInBlock.gradeId === grade.gradeId;
    });

    if (selectedGrade) {
      return [
        tk.utils.getNumberOverZero(selectedGrade.remainCnt),
        tk.utils.getNumberOverZero(selectedGrade.waitingCnt),
      ];
    }

    return [null, null];
  }

  /**
   * @description 영역 내 등급, 등급 내 영역 정보 설정
   * @param {Array} gradeBlocks 영역 내 등급, 등급 내 영역 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setGradesInBlock(gradeBlocks) {
    if (!Array.isArray(gradeBlocks)) {
      return false;
    }
    scope.blockInGradeMap = {};
    scope.gradeInBlockMap = {};

    _.each(gradeBlocks, function (gradeBlock) {
      if (gradeBlock.blockId < 1 || gradeBlock.gradeId < 1) {
        return;
      }

      // 영역 내 등급 설정
      if (!Array.isArray(scope.blockInGradeMap[gradeBlock.gradeId])) {
        scope.blockInGradeMap[gradeBlock.gradeId] = [];
      }

      scope.blockInGradeMap[gradeBlock.gradeId].push(gradeBlock);

      // 등급 내 영역 설정
      if (!Array.isArray(scope.gradeInBlockMap[gradeBlock.blockId])) {
        scope.gradeInBlockMap[gradeBlock.blockId] = [];
      }

      scope.gradeInBlockMap[gradeBlock.blockId].push(gradeBlock);
    });
    return true;
  }

  /**
   * @description 비지정 판매정보 설정
   * @param {Array} zones 비지정 판매정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setZoneSoldMap(zones) {
    if (!Array.isArray(zones)) {
      return false;
    }
    scope.zoneSoldMap = {};
    scope.zoneWaitMap = {};
    _.each(zones, function (zone) {
      scope.zoneSoldMap[zone.logicalZoneId] = zone.remainCnt;
      if (zone.hasOwnProperty("waitingCnt")) {
        scope.zoneWaitMap[zone.logicalZoneId] = zone.waitingCnt;
      }
    });
    return true;
  }

  /**
   * @description 지정석 설정
   * @param {Array} seats 지정석 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setSeats(seats) {
    if (!Array.isArray(seats)) {
      return false;
    }

    _.each(seats, function (seat) {
      scope.seatMap[seat.logicalSeatId] = seat;
      // seat.area = {"virtualX": x, "virtualY": y};
      // 사석 -----------------------------------------------------------------
      // tkPlanState.setBlockRowColBySeat(seat); // 사석을 위한 RowCol 추가
      scope.setBlockLinkedBySeat(seat); // 사석을 위한 linked 추가
      // ----------------------------------------------------------------------
      scope.setBlockGroupBySeat(seat); // 묶음 좌석을 위한 group 추가
      scope.setWaitingLinkedBySeat(seat); // 예매대기를 위한 linked 추가
    });
    return true;
  }

  /**
   * @description [예매대기 전용] 지정석 판매정보 초기화
   * @return {Boolean} 설정 성공 여부
   */
  function _restoreSeatSoldMap() {
    var seatKeys = Object.keys(scope.seatMap);
    if (seatKeys.length !== 0) {
      seatKeys.map(function (key) {
        scope.seatSoldMap[key] = true;
      });
    }

    // var zoneKeys = Object.keys(scope.zoneSoldMap);
    // if (zoneKeys.length !== 0) {
    // 	zoneKeys.map(function (key) {
    // 		scope.zoneSoldMap[key] = null;
    // 	});
    // }

    return true;
  }

  /**
   * @description [예매대기 전용]
   * 							없는 좌석에 한해서 지정석 판매정보 기본값 고정
   * 							비동기로 인한 기본값 없는 좌석에 한해서 기본값 주입
   * @return {Boolean} 설정 성공 여부
   */
  function _filteredSeatSoldMap() {
    var keys = Object.keys(scope.seatMap);

    if (keys.length === 0) {
      return true;
    }

    keys.map(function (key) {
      if (!scope.seatSoldMap.hasOwnProperty(key)) {
        scope.seatSoldMap[key] = true;
      }
    });

    return true;
  }

  /**
   * @description 지정석 판매정보 설정
   * @param {Object} seats 지정석 판매정보 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setSeatSoldMap(seats) {
    if (typeof seats !== "object") {
      return false;
    }

    _.each(seats, function (value, sId) {
      scope.seatSoldMap[sId] = value;
    });
    return true;
  }

  /**
   * @description 영역 로우콜 설정
   * @param {Object} seat 좌석 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setBlockRowColBySeat(seat) {
    if (!seat || seat.rowIdx < 0 || seat.colIdx < 0) {
      return false;
    }

    var rowCol = scope.blockRowColMap[seat.blockId];
    if (!rowCol) {
      rowCol = [];
      scope.blockRowColMap[seat.blockId] = rowCol;
    }

    var row = rowCol[seat.linkedId];
    if (!row) {
      row = [];
      rowCol[seat.linkedId] = row;
    }

    row[seat.orderNum] = seat;
    return true;
  }

  /**
   * @description 영역 연석 설정
   * @param {Object} seat 좌석 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setBlockLinkedBySeat(seat) {
    if (!seat || seat.linkedId < 1 || seat.orderNum < 1) {
      return false;
    }

    var linkedSeatList = scope.blockLinkedMap[seat.blockId];
    if (!linkedSeatList) {
      linkedSeatList = {};
      scope.blockLinkedMap[seat.blockId] = linkedSeatList;
    }

    var row = linkedSeatList[seat.linkedId];
    if (!row) {
      row = {};
      linkedSeatList[seat.linkedId] = row;
    }

    row[seat.orderNum] = seat;
    return true;
  }

  /**
   * @description 영역 묶음좌석 설정
   * @param {Object} seat 좌석 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setBlockGroupBySeat(seat) {
    if (!seat || seat.group < 1) {
      return false;
    }

    var groupMap = scope.blockGroupMap[seat.blockId];
    if (!groupMap) {
      groupMap = {};
      scope.blockGroupMap[seat.blockId] = groupMap;
    }

    var group = groupMap[seat.groupId];
    if (!group) {
      group = {};
      groupMap[seat.groupId] = group;
    }
    group[seat.logicalSeatId] = seat;
    return true;
  }

  /**
   * @description [예매대기전용] 예매대기 묶음좌석 설정 - 사용자가 예매한 좌석끼리 묶음
   * @param {Object} seat 좌석 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setWaitingLinkedBySeat(seat) {
    if (!seat || seat.waitingLinkedId < 1) {
      // || seat.orderNum < 1
      return false;
    }

    if (!scope.blockWaitingLinkedMap[seat.waitingLinkedId]) {
      scope.blockWaitingLinkedMap[seat.waitingLinkedId] = {};
    }
    var seats = scope.blockWaitingLinkedMap[seat.waitingLinkedId];

    seats[seat.logicalSeatId] = seat;

    return true;
  }

  /**
   * @description 매수 제어 설정
   * @param {Object} limit 매수 제어 정보
   * @return {Boolean} 설정 성공 여부
   */
  function _setLimit(limit) {
    scope.limitTotalCount = limit.totalCnt;

    var grades = limit.grades;

    _.each(grades, function (grade) {
      scope.limitGradeMap[grade.productGradeId] = grade.cnt;
      scope.gradeCountLimitTypeMap[grade.productGradeId] = grade.countLimitType;

      if (grade.check) {
        scope.exceptionalLimitGradeMap[grade.productGradeId] = true;
      }
    });
    return true;
  }

  /**
   * @description 영역 내 비지정 정보 설정
   * @return {Boolean} 설정 성공 여부
   */
  function setBlockZoneMap() {
    _.each(scope.zoneMap, function (zone) {
      if (zone.blockId) {
        scope.blockZoneMap[zone.blockId] = zone;
      }
    });
    return true;
  }

  /**
   * @description 레벨에 따른 도면 크기 반환
   * @return {Number} 레벨에 따른 도면 크기 반환
   */
  function _getMapSizeOfLevel(level) {
    level = level !== undefined ? level : 0;
    return scope.bgImageTileSize * Math.pow(2, level);
  }

  /**
   * @description 배경 이미지 섬네일 반환
   * @return {Object} 배경 이미지 섬네일
   */
  function _getBgImageThumnail(size) {
    return tk.util.canvas.getImage(scope.bgImageUrlThumnail, {
      parameter: { size: size },
    });
  }

  /**
   * @description 영역 이미지 섬네일 반환
   * @return {Object} 영역 이미지 섬네일
   */
  function _getAreaImageThumnail(size) {
    return tk.util.canvas.getImage(scope.areaImageUrlThumnail, {
      parameter: { size: size },
    });
  }

  /**
   * @description Url '{size}x{size}' 형태로 사용할 수 있도록 변환
   * @return {String} 변환된 url
   */
  function reformatUrl(url) {
    if (!url) {
      return null;
    }
    var query = tk.utils.parseUrl(url).query;
    var changedQuery = "{size}x{size}";
    return url.replace(new RegExp(query, "g"), changedQuery);
  }

  /**
   * @description 직접선택 도면 여부 반환
   * @return {Boolean} 직접선택 도면 여부
   */
  function _isDirectSelect() {
    return scope.selectType === scope.SELECT_TYPE.DIRECT;
  }

  /**
   * @description 부분노출 여부 반환
   * @return {Boolean} 부분노출 여부
   */
  function _isPartExposure() {
    return scope.exposureType === scope.EXPOSURE_TYPE.PART;
  }

  /**
   * @description 페이징 정보를 호출할 필요 여부 반환
   * @return {Boolean} 페이징 정보를 호출할 필요 여부
   */
  function _isNeedToPagingCall(key) {
    if (!scope.pagingBoolMap[key]) {
      return false;
    }

    return (
      !scope.pagingLoadCanvasMap[key] ||
      (scope.pagingLoadCanvasMap[key] && !scope.pagingLoadSoldoutMap[key])
    );
  }

  /**
   * @description [예매대기전용] 객체 데이터 리셋
   */
  function _reservationWaitingRelease() {
    scope.seatMap = {};
    scope.gradeMap = {};
    scope.gradeAgreeMap = {};
    scope.isPreSale = null;

    // scope.sectionInfo = [];
    // scope.sectionMap = {};

    scope.blockInGradeMap = {};
    scope.gradeInBlockMap = {};

    scope.zoneSoldMap = {};
    scope.zoneWaitMap = {};

    scope.seatSoldMap = {};

    scope.blockRowColMap = {};
    scope.blockRowColMap = {};

    scope.blockLinkedMap = {};

    scope.blockGroupMap = {};
    scope.blockWaitingLinkedMap = {};

    // scope.limitGradeMap = {};
    scope.exceptionalLimitGradeMap = {};

    // scope.blockZoneMap = {};
    initPagingInfo(scope.pagingInfo);
  }

  /**
   * @description 객체 릴리즈
   */
  function _release() {
    scope.productName = null;
    scope.placeName = null;
    scope.physical = null;
    scope.logical = null;
    scope.schedule = null;
    scope.limitGradeMap = null;

    scope.physicalPlan = null;
    scope.bgInfo = null;
    scope.bgImageTileUrl = null;
    scope.pagingInfo = null;
    scope.blockInfo = null;
    scope.zoneInfo = null;

    scope.areaBgInfo = null;
    scope.areaImageUrlThumnail = null;

    scope.gradeInfo = null;
    scope.gradeMap = null;
    scope.gradeInBlockMap = null;

    scope.blockMap = null;
    scope.blockInGradeMap = null;
    scope.blockRowColMap = null;
    scope.blockLinkedMap = null;
    scope.blockWaitingLinkedMap = null;
    scope.blockGroupMap = null;
    scope.blockZoneMap = null;

    scope.sectionInfo = null;
    scope.sectionMap = null;

    scope.pagingBoolMap = null;
    scope.pagingLoadCanvasMap = null;
    scope.pagingMap = null;

    scope.blockSeatMap = null;

    scope.seatMap = null;
    scope.seatSoldMap = null;
    scope.blockGroupMap = null;

    scope.zoneMap = null;
    scope.zoneSoldMap = null;
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc 좌석 선택 state
 * @external tk.utils, tk.state.plan, tk.i18n.translate, tk.state.global.meta, tk.state.waitingDetail
 */

tk.utils.createNamespace("tk.state.select");
tk.state.select = (function () {
	'use strict';

	var scope = {};

	var selectedBlocks = null;

	var tkPlanState = tk.state.plan;

	/**
	 * 좌석 선택 타입
	 * 0 : 선택하지 않음
	 * 1 : 자동배정
	 * 2 : 직접선택
	 */
	scope.SELECTED_TYPE = {
		NONE: 0,
		AUTO_SELECT: 1,
		SELF_SELECT: 2
	};

	scope.selectedType = scope.SELECTED_TYPE.NONE; // 좌석 선택 타입
	scope.selectedBlock = null; // 선택된 영역
	scope.selectedGrade = null; // 선택된 등급
	scope.selectedSeatMap = {}; // 선택된 좌석
	scope.selectedZoneMap = {}; // 선택된 비지정석
	scope.selectedLimitGradeMap = {}; // 선택된 등급 매수제어
	scope.deadSeatMap = {}; // 사석
	scope.autoSelectCount = 0; // 선택된 자동배정
	scope.selectedSectionMap = []; // [예매대기전용] 선택된 구역
	scope.selectedSectionInBlockMap = [] // [예매대기전용] 선택된 구역 & 블록

	scope.hasSelectedSeats = false; // 좌석이 선택되었는지 여부
	scope.isFailureInPurchaseCountLimit = false;	// 구매가능매수 초과 여부

	scope.allotmentList = []; // 보여준 기획사 문구 목록

	scope.setSelectedType = _setSelectedType;
	scope.isGradeSelected = _isGradeSelected;
	scope.setSelectedGrade = _setSelectedGrade;
	scope.getSelectedBlocks = _getSelectedBlocks;
	scope.hasSelectedBlocks = _hasSelectedBlocks;
	scope.setSelectedBlocks = _setSelectedBlocks;
	scope.selectBlock = _selectBlock;
	scope.getSelectSeats = _getSelectSeats;
	scope.selectSeat = _selectSeat;
	scope.isSelectSeatsAndZonesEmpty = _isSelectSeatsAndZonesEmpty;
	scope.getSelectZones = _getSelectZones;
	scope.selectZone = _selectZone;
	scope.checkZoneLessThanOne = _checkZoneLessThanOne;
	scope.getSelectSeatsAndZones = _getSelectSeatsAndZones;
	scope.getTotalCnt = _getTotalCnt;
	scope.updateZoneCount = _updateZoneCount;
	scope.updateAutoSelectCount = _updateAutoSelectCount;
	scope.updateSelectSection = _updateSelectSection;
	scope.claerSelectSection = _claerSelectSection;
	scope.isSeatLimitValidate = _isSeatLimitValidate;
	scope.isGradeLimitValidate = _isGradeLimitValidate;
	scope.isGroupSeatLimitValidate = _isGroupSeatLimitValidate;
	scope.isGradeAgreeValidate = _isGradeAgreeValidate;
	scope.isPreReserveSaleValidate = _isPreReserveSaleValidate;
	scope.getZoneSelectCount = _getZoneSelectCount;
	scope.getAutoSelectSelectCount = _getAutoSelectSelectCount;
	scope.setDeadSeatMap = _setDeadSeatMap;
	scope.clearSelectedSeats = _clearSelectedSeats;
	scope.isGradeAgreeValidateGroup = _isGradeAgreeValidateGroup;
	scope.isGroupAleradyValidatie = _isGroupAleradyValidatie;

	/**
	 * @description 좌석 선택 설정
	 * @param {Number} newType 변경할 좌석 선택 타입
	 */
	function _setSelectedType (newType) {
		var oldType = scope.selectedType;
		if (newType === scope.SELECTED_TYPE.AUTO_SELECT || oldType === scope.SELECTED_TYPE.AUTO_SELECT) {
			_clearSelectedSeats();

			tk.event.view.signals.gotoAreaPlan.dispatch();
		}
		scope.selectedType = newType;
	}

	/**
	 * @description 등급이 선택되었는지 여부 반환
	 * @return {Boolean} 등급이 선택되었는지 여부
	 */
	function _isGradeSelected () {
		return !!scope.selectedGrade;
	}

	/**
	 * @description 등급이 선택
	 * @return {Object} 선택할 등급
	 */
	function _setSelectedGrade (grade) {
		// 새로운 등급이 설정되면 자동배정 초기화
		if (grade !== scope.selectedGrade) {
			scope.autoSelectCount = 0;
		}
		scope.selectedGrade = grade;
	}

	/**
	 * @description 선택된 영역 반환
	 * @return {Object} 선택된 영역
	 */
	function _getSelectedBlocks () {
		var color;
		if (!selectedBlocks) {
			return {
				color: null,
				blocks: []
			};
		}

		// 선택된 영역에 대한 등급 색
		if (!scope.selectedGrade) {
			color = 'black'
		} else {
			color = scope.selectedGrade.hasOwnProperty('color') ? scope.selectedGrade.color : 'black'
		}
		return {
			color: color,
			blocks: selectedBlocks
		}
	}

	/**
	 * @description 선택된 영역 존재 유무 반환
	 * @return {Boolean} 선택된 영역 존재 유무
	 */
	function _hasSelectedBlocks () {
		return Array.isArray(selectedBlocks) && selectedBlocks.length > 0;
	}

	/**
	 * @description 영역들 선택
	 * @param {Array} blocks 선택될 영역들
	 */
	function _setSelectedBlocks (blocks) {
		if (!Array.isArray(blocks)) {
			blocks = null;
			return;
		}

		var selected = [];

		_.each(blocks, function (block) {
			if (!block.hasOwnProperty('cornerPoints')) {
				var blockId = block.blockId;
				block = tkPlanState.blockMap[blockId];
				if (block === undefined) {
					return;
				}
			}
			selected.push(block);
		});

		selectedBlocks = selected;
		tk.event.service.signals.s2u_updatedSelectedBlock.dispatch(selected);
	}

	/**
	 * @description 영역 선택
	 * @param {Object} block 영역
	 * @param {Object} tkPlanState 도면 상태
	 * @param {Object} tkViewState 뷰 상태
	 */
	function _selectBlock (block, tkPlanState, tkViewState) {
		if (!block) {
			return;
		}
		if (!block.hasOwnProperty('cornerPoints')) {
			var blockId = block.blockId;
			block = tkPlanState.blockMap[blockId];
		}

		if (tkPlanState.hasArea) {
			// tkViewState.foldSeatLayerOpen();
			scope.selectedBlock = block;

			if (tkPlanState.isPartExposure()) {
				// 영역 페이징 호출 맵 초기화
				_.each(tkPlanState.blockCallMap, function (value, key) {
					tkPlanState.blockCallMap[key] = false;
				});
			}

			tk.event.view.signals.gotoSeatPlanEvent.dispatch(block);

			// if (tkPlanState.isPartExposure()) {
			// 	if (!tk.utils.isWaitingReservation()) {
			// 		tk.event.service.signals.updateReservationSeatDataByBlock.dispatch([block.blockId]);
			// 	}
			// }
		}
	}

	/**
	 * @description 선택된 좌석들 반환
	 * @return {Array} 선택된 좌석들
	 */
	function _getSelectSeats () {
		var seats = [];
		for (var key in scope.selectedSeatMap) {
			seats.push(scope.selectedSeatMap[key]);
		}
		return seats;
	}

	/**
	 * @description 지정석 선택
	 * @param {Object} seat 선택할 좌석
	 * @return {Boolean} 지정석 선택 성공 여부
	 */
	function _selectSeat (seat) {
		if (!seat) {
			return false;
		}

		// 다시 선택시 선택한 좌석 제거
		if (scope.selectedSeatMap[seat.logicalSeatId]) {
			delete scope.selectedSeatMap[seat.logicalSeatId];
			scope.selectedLimitGradeMap[seat.gradeId] -= 1;

			if (scope.isSelectSeatsAndZonesEmpty()) {
				scope.hasSelectedSeats = false;
			}
			tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
			return false;
		}

		/**
		 *
		 * 1.구매등급
		 * 2.선예매
		 * 3.등급동의
		 * 4.매수제어
		 *
		 */
		// // 구매 등급 제약에 해당되는 경우
		// if (_isGradeRestrictionValidate(seat.gradeId)) {
		// 	return false;
		// }

		// 선예매 등급인 경우
		if (!_isPreReserveSaleValidate(seat.gradeId)) {
			return false;
		}

		// 등급 동의를 하지 않은 경우
		var isGroupSeat = seat.groupId !== 0;
		if (isGroupSeat) {
			if (!_isGradeAgreeValidateGroup(seat)) {
				return false;
			}
		} else {
			if (!_isGradeAgreeValidate(seat.gradeId)) {
				return false;
			}
		}

		// 매수제어에 걸린 경우
		if (!_isSeatLimitValidate(seat)) {
			return false;
		}

		// 모든 유효성 통과 후, 좌석 알림 문구 출력
		_alarmSeatNotice(seat);

		// 사석시 사석에서 제거
		if (scope.deadSeatMap[seat.logicalSeatId]) {
			delete scope.deadSeatMap[seat.logicalSeatId];
		}

		scope.hasSelectedSeats = true;
		scope.selectedSeatMap[seat.logicalSeatId] = Object.assign(seat, {st: (new Date()).getTime()});

		// 등급 매수제어 처리
		if (scope.selectedLimitGradeMap[seat.gradeId] === undefined) {
			scope.selectedLimitGradeMap[seat.gradeId] = 0;
		}
		scope.selectedLimitGradeMap[seat.gradeId] += 1;
		tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
		return true;
	}

	/**
	 * @description 선택된 좌석이 없는지 여부 반환
	 * @return {Boolean} 선택된 좌석이 없는지 여부
	 */
	function _isSelectSeatsAndZonesEmpty () {
		return _getTotalCnt() === 0;
	}

	/**
	 * @description 선택된 비지정석 반환
	 * @return {Array} 선택된 비지정석
	 */
	function _getSelectZones () {
		var zones = [];
		for (var key in scope.selectedZoneMap) {
			zones.push(scope.selectedZoneMap[key]);
		}
		return zones;
	}

	/**
	 * @description 좌석 선택 알람
	 * @return void
	 */
	function _alarmSeatNotice (seat) {
		if (!scope.selectedSeatMap[seat.logicalSeatId]) {
			const allotmentInfoList = tk.state.global.meta.productAllotmentInfo;
			if (!Array.isArray(allotmentInfoList)) {
				return;
			}

			if (0 < allotmentInfoList.length) {
				const seatAllotment = seat.allotmentCode;
				if (!scope.allotmentList.includes(seatAllotment)) {
					for (let i=0; i<allotmentInfoList.length; i++) {
						if (seatAllotment === allotmentInfoList[i].allotmentCode) {
							scope.allotmentList.push(seatAllotment);
							if (tk.state.global.globalLocale === 'ko') {
								alert('선택하신 좌석은 [' + allotmentInfoList[i].allotmentName + ']석입니다.\n' + allotmentInfoList[i].noticeMessage);
							} else {
								alert('The seat you selected is a [' + allotmentInfoList[i].allotmentName + '] seat.\n' + allotmentInfoList[i].noticeMessage);
							}

							break;
						}
					}
				}
			}
		}
	}

	/**
	 * @description 비지정석 선택
	 * @param {Object} zone 선택할 비지정석
	 * @return {Boolean} 비지정석 선택 성공 여부
	 */
	function _selectZone (zone) {
		if (!zone) {
			return false;
		}

		var gradeId = zone.gradeId;

		/**
		 *
		 * 1.구매등급
		 * 2.선예매
		 * 3.등급동의
		 * 4.매수제어
		 * 5. [예매대기전용] 예매된 좌석이 없는 경우
		 */
		// // 구매 등급 제약에 해당되는 경우
		// if (_isGradeRestrictionValidate(zone.gradeId)) {
		// 	return false;
		// }

		// 선예매 등급인 경우
		if (!_isPreReserveSaleValidate(gradeId)) {
			return false;
		}

		// 등급 동의를 하지 않은 경우
		if (!_isGradeAgreeValidate(gradeId)) {
			return false;
		}

		// 매수 제어 처리
		if (!_isGradeLimitValidate(gradeId)) {
			return false;
		}

		// [예매대기전용]
		if (tk.utils.isWaitingReservation()) {
			// 남는 좌석 없는 경우
			var soldZone = tkPlanState.zoneSoldMap[zone.logicalZoneId];
			if (soldZone === null || soldZone === undefined) {
				return false;
			}

			// 구역형인 경우
			var reservationType = tk.state.waitingDetail.getReservationType();
			if (reservationType === 'SECTION') {
				return false;
			}
		}

		scope.hasSelectedSeats = true;
		scope.selectedZoneMap[zone.logicalZoneId] = zone;
		tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
		return true;
	}

	/**
	 * @description 비지정석 매수가 1보다 적은지 확인
	 * @param {Object} zone 확인할 비지정석
	 */
	function _checkZoneLessThanOne (zone) {
		if (!zone) {
			return;
		}
		if (zone.count < 1) {
			delete scope.selectedZoneMap[zone.logicalZoneId];
		}

		var seatAndZone = scope.getSelectSeatsAndZones();
		if (seatAndZone.length < 1) {
			scope.hasSelectedSeats = false;
		}
		tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
	}

	/**
	 * @description 선택된 지정석과 비지정석 반환
	 * @return {Array} 선택된 지정석과 비지정석
	 */
	function _getSelectSeatsAndZones () {
		var seatsAndZone = [];
		for (var key in scope.selectedSeatMap) {
			var seat = {
				mapInfo: scope.selectedSeatMap[key].mapInfo,
				gradeName: getGradeName(scope.selectedSeatMap[key].gradeId),
				color: getGradeColor(scope.selectedSeatMap[key].gradeId)
			};
			seatsAndZone.push(seat);
		}
		for (var key in scope.selectedZoneMap) {
			var zone = {
				mapInfo: scope.selectedZoneMap[key].zoneName,
				gradeName: getGradeName(scope.selectedZoneMap[key].gradeId),
				color: getGradeColor(scope.selectedZoneMap[key].gradeId),
				count: scope.selectedZoneMap[key].count
			};
			seatsAndZone.push(zone);
		}
		return seatsAndZone;
	}

	/**
	 * @description 선택된 좌석 개수 반환
	 * @return {Number} 선택된 좌석 개수
	 */
	function _getTotalCnt () {
		var totalCnt = 0;
		var seatsAndZones = _getSelectSeatsAndZones();
		for (var idx = 0; idx < seatsAndZones.length; idx++) {
			var each = seatsAndZones[idx];
			if (each.hasOwnProperty('count')) {
				totalCnt += each.count;
			} else {
				totalCnt += 1;
			}
		}
		totalCnt += scope.autoSelectCount;
		return totalCnt;
	}

	/**
	 * @description 비지정석 매수 갱신
	 * @param {Object} zone 갱신할 비지정석
	 * @param {Number} value 갱신할 매수
	 * @return {Boolean} 비지정석 매수 갱신 성공 여부
	 */
	function _updateZoneCount (zone, value) {
		if (!zone) {
			return false;
		}

		// 증가한 매수에 대한 매수제어 처리
		var incrementSize = value - zone.count;
		if (incrementSize > 0 && !isZoneLimitValidate(zone, incrementSize)) {
			return false;
		}
		zone.count = value;

		// 등급 매수제어 처리
		if (scope.selectedLimitGradeMap[zone.gradeId] === undefined) {
			scope.selectedLimitGradeMap[zone.gradeId] = 0;
		}
		scope.selectedLimitGradeMap[zone.gradeId] += incrementSize;

		if (scope.isSelectSeatsAndZonesEmpty()) {
			scope.hasSelectedSeats = false;
		}
		tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
		return true;
	}

	/**
	 * @description 자동배정 매수 갱신
	 * @param {Object} grade 갱신할 등급
	 * @param {Number} value 갱신할 매수
	 */
	function _updateAutoSelectCount (grade, value) {
		if (!grade) {
			return;
		}

		// 증가한 매수에 대한 매수제어 처리
		var incrementSize = value - scope.autoSelectCount;
		if (incrementSize > 0 && !isAutoSelectLimitValidate(grade, incrementSize)) {
			return;
		}
		if (value > grade.remainCnt) {
			return;
		}

		// 등급 매수제어 처리
		if (scope.selectedLimitGradeMap[grade.gradeId] === undefined) {
			scope.selectedLimitGradeMap[grade.gradeId] = 0;
		}
		scope.selectedLimitGradeMap[grade.gradeId] += incrementSize;

		scope.autoSelectCount = value;
	}

	/**
	 * @description 선택한 구역 업데이트
	 * @param {Object} grade 갱신할 구역
	 */
	function _updateSelectSection (sectionsInBlocks) {
		scope.selectedSectionMap = [];
		scope.selectedSectionInBlockMap = [];
		if (!Array.isArray(sectionsInBlocks)) {
			return false;
		}
		if (sectionsInBlocks.length > 0) {
			sectionsInBlocks = JSON.parse(JSON.stringify(sectionsInBlocks));

			scope.selectedSectionInBlockMap = sectionsInBlocks.map(function (block) {
				block.sections = block.sections.filter(function (section) {
					if (section.selected) {
						scope.selectedSectionMap.push({
							sectionId: section.sectionId,
							sectionName: section.name,
							blockName: block.name,
							blockId: block.blockId,
							blockColor: block.color,
						});
					}
					return section.selected;
				});
				return block
			}).filter(function (block) {
				return block.sections.length !== 0;
			});
		}

		TLEventManager.getInstance().signals.updateRender.dispatch();
	}

	/**
	 * @description 선택한 구역 초기화
	 */
	function _claerSelectSection () {
		scope.selectedSectionMap = [];
		scope.selectedSectionInBlockMap = [];
	}

	/**
	 * @description 지정석 매수제어 처리
	 * @param {Object} seat 선택한 지정석
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function _isSeatLimitValidate (seat) {
		return isLimitValidate(seat.gradeId, 1);
	}

	/**
	 * @description 묶음좌석 매수제어 처리
	 * @param {Object} group 선택한 묶음좌석
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function _isGroupSeatLimitValidate (group) {
		var groupKeys = Object.keys(group);
		var groupSize = groupKeys.length;
		var firstSeatInGroup = group[groupKeys[0]];
		var gradeId = firstSeatInGroup.gradeId;

		// 이미 선택되어 있는 좌석은 통과
		if (scope.selectedSeatMap[firstSeatInGroup.logicalSeatId]) {
			return true;
		}

		return isLimitValidate(gradeId, groupSize);
	}

	/**
	 * @description 비지정석 매수제어 처리
	 * @param {Object} zone 선택한 비지정석
	 * @param {Number} value 선택한 매수
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function isZoneLimitValidate (zone, value) {
		return isLimitValidate(zone.gradeId, value);
	}

	/**
	 * @description 자동배정 매수제어 처리
	 * @param {Object} grade 선택한 등급
	 * @param {Number} value 선택한 매수
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function isAutoSelectLimitValidate (grade, value) {
		return isLimitValidate(grade.gradeId, value);
	}

	/**
	 * @description 등급에 대한 매수제어 처리
	 * @param {Number} gradeId 선택한 등급 id
	 * @param {Number} size 선택한 매수
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function isLimitValidate (gradeId, size) {
		var totalCnt = _getTotalCnt();

		var isExceptionalLimit = tkPlanState.exceptionalLimitGradeMap[gradeId]; // 예외 등급 여부
		var selectedLimitGradeSize = Object.keys(scope.selectedLimitGradeMap).length;
		var isGradeCountLimit = tkPlanState.gradeCountLimitTypeMap[gradeId]; // 등급의 매수제어가 있는 경우

		var isWaitingReservation = tk.utils.isWaitingReservation();

		// 이전에 선택된 등급이 있는 경우
		if (selectedLimitGradeSize > 0) {
			for (var selectedGradeId in scope.selectedLimitGradeMap) {
				if (!scope.selectedLimitGradeMap[selectedGradeId]) {
					continue;
				}

				// 예외 등급이 있는지 확인
				if (isExceptionalLimit) {
					if (gradeId !== parseInt(selectedGradeId, 10)) {
						alert(tk.i18n.translate.getTranslate("SEAT_TYPE_CAN_NOT_BE_PURCHASE_2"));
						return false;
					}
				} else {
					if (tkPlanState.exceptionalLimitGradeMap[selectedGradeId]) {
						alert(tk.i18n.translate.getTranslate("SEAT_TYPE_CAN_NOT_BE_PURCHASE_1"));
						return false;
					}
				}
			}
		}

		// 최대 구매장수 초과
		if (tkPlanState.limitTotalCount < totalCnt + size) {
			if (isWaitingReservation) {
				alert('최대 ' + tkPlanState.limitTotalCount + '매까지 선택 가능합니다.');
				return false;
			} else if (!isExceptionalLimit && !isWaitingReservation) {
				alert(tk.i18n.translate.getTranslate("PURCHASE_TOTAL_MAXIMUM_N_TICKET", tkPlanState.limitTotalCount));
				return false;
			}
		}

		// 등급당 구매장수 초과
		if (!isWaitingReservation) {
			var selectedLimitGrade = scope.selectedLimitGradeMap[gradeId] !== undefined ? scope.selectedLimitGradeMap[gradeId] : 0;
			if (isExceptionalLimit && tkPlanState.limitGradeMap[gradeId] < selectedLimitGrade + size) {
				alert(tk.i18n.translate.getTranslate("PURCHASE_GRADE_MAXIMUM_N_TICKET", tkPlanState.limitGradeMap[gradeId]));
				return false;
			}

			if (isGradeCountLimit && tkPlanState.limitGradeMap[gradeId] < selectedLimitGrade + size) {
				alert(tk.i18n.translate.getTranslate("PURCHASE_GRADE_MAXIMUM_N_TICKET", tkPlanState.limitGradeMap[gradeId]));
				return false;
			}
		}

		return true;
	}

	/**
	 * @description 등급에 대한 매수제어 처리
	 * @param {Number} gradeId 선택한 등급 id
	 * @return {Boolean} 매수가 유요한지 여부
	 */
	function _isGradeLimitValidate (gradeId) {
		var isExceptionalLimit = tkPlanState.exceptionalLimitGradeMap[gradeId]; // 예외 등급 여부
		var selectedLimitGradeSize = Object.keys(scope.selectedLimitGradeMap).length;

		// 이전에 선택된 등급이 있는 경우
		if (selectedLimitGradeSize > 0) {
			for (var selectedGradeId in scope.selectedLimitGradeMap) {
				if (!scope.selectedLimitGradeMap[selectedGradeId]) {
					continue;
				}

				// 예외 등급이 있는지 확인
				if (isExceptionalLimit) {
					if (gradeId !== parseInt(selectedGradeId, 10)) {
						alert(tk.i18n.translate.getTranslate("SEAT_TYPE_CAN_NOT_BE_PURCHASE_2"));
						return false;
					}
				} else {
					if (tkPlanState.exceptionalLimitGradeMap[selectedGradeId]) {
						alert(tk.i18n.translate.getTranslate("SEAT_TYPE_CAN_NOT_BE_PURCHASE_1"));
						return false;
					}
				}
			}
		}
		return true;
	}

	/**
	 * @description 등급 동의 처리
	 * @param {String|Number} gradeId 등급 id
	 * @return {Boolean} 등급 동의가 유효한지 여부
	 */
	function _isGradeAgreeValidate (gradeId) {
		var gradeAgree = tkPlanState.gradeAgreeMap[gradeId];

		if (!gradeAgree.hasContext) {
			return true;
		}

		if (gradeAgree.isAgree) {
			return true;
		}
		var answer = confirm(gradeAgree.agreeContext);
		gradeAgree.isAgree = answer;
		return answer;
	}

	/**
	 * @description 등급 동의 처리 - 그룹
	 * @param {Object} seat 확인할 좌석
	 * @return {Boolean} 등급 동의가 유효한지 여부
	 */
	function _isGradeAgreeValidateGroup (seat) {
		var gradeId = seat.gradeId;

		var gradeAgree = tkPlanState.gradeAgreeMap[gradeId];
		var groupKeys = Object.keys(tkPlanState.blockGroupMap[seat.blockId][seat.groupId]);
		var confirmCnt = groupKeys.length;

		if (!gradeAgree.hasContext) {
			return true;
		}

		if (gradeAgree.isAgree) {
			return true;
		}

		if (gradeAgree.confirmIdx === 0) {
			var answer = confirm(gradeAgree.agreeContext);
			gradeAgree.isAgree = answer;
			gradeAgree.confirmIdx += 1;
		} else if (gradeAgree.confirmIdx === confirmCnt - 1) {
			gradeAgree.confirmIdx = 0;
		} else {
			gradeAgree.confirmIdx += 1;
		}
		return gradeAgree.isAgree;
	}

	/**
	 * @description 선예매 처리
	 * @param {String|Number} gradeId 등급 id
	 * @return {Boolean} 선예매 유효한지 여부
	 */
	function _isPreReserveSaleValidate (gradeId) {
		var grade = tkPlanState.gradeMap[gradeId];
		if (!grade) {
			return false;
		}

		var preReserveSale = tkPlanState.gradeMap[gradeId].preReserveSale;

		//대상 회원이 선예매 기간에 해당하고 선택한 등급이 선예매가 유효하지 않은경우
		if (tkPlanState.isPreSale && !preReserveSale) {
			//alert(tk.i18n.translate.getTranslate("THIS_SEAT_TYPE_CAN_NOT_BE_PURCHASED_NOW"));
			alert(tk.i18n.translate.getTranslate("THERE_IS_NO_SEAT_AVAILABLE_ON_PRESALE_PERIOD"));
			return false;
		}

		return true;
	}

	/**
	 * @description 등급 구매 제약
	 * @param {String|Number} gradeId 등급 id
	 * @return {Boolean} 등급 구매 제약 여부
	 */
	// function _isGradeRestrictionValidate (gradeId) {
	// 	var grade = tkPlanState.gradeMap[gradeId];
	// 	if (!grade) {
	// 		return false;
	// 	}
	//
	// 	return grade.restriction;
	// }

	/**
	 * @description 등급 반환
	 * @param {Number} gradeId 등급 id
	 * @return {Object} 등급
	 */
	function getGrade (gradeId) {
		return tkPlanState.gradeMap[gradeId];
	}

	/**
	 * @description 등급 이름 반환
	 * @param {Number} gradeId 등급 id
	 * @return {String} 등급 이름
	 */
	function getGradeName (gradeId) {
		var grade = getGrade(gradeId);
		return grade ? grade.name : '';
	}

	/**
	 * @description 등급 색 반환
	 * @param {Number} gradeId 등급 id
	 * @return {String} 등급 색
	 */
	function getGradeColor (gradeId) {
		var grade = getGrade(gradeId);
		return grade ? grade.color : 'black';
	}

	/**
	 * @description 비지정석 선택가능 매수 반환
	 * @param {Object} zone 비지정석
	 * @return {Number} 선택가능 매수
	 */
	function _getZoneSelectCount (zone) {
		if (zone === undefined) {
			return 0;
		}
		var selectCount = getSelectCount(zone.gradeId) + zone.count;
		var zoneRemainCnt = tkPlanState.zoneSoldMap[zone.logicalZoneId];
		zoneRemainCnt = zoneRemainCnt === undefined ? 0 : zoneRemainCnt;
		return selectCount < zoneRemainCnt ? selectCount : zoneRemainCnt;
	}

	/**
	 * @description 자동배정 선택가능 매수 반환
	 * @param {Object} grade 등급
	 * @return {Number} 선택가능 매수
	 */
	function _getAutoSelectSelectCount (grade) {
		if (grade === undefined) {
			return 0;
		}
		var selectCount = getSelectCount(grade.gradeId) + scope.autoSelectCount;
		var gradeRemainCnt = grade.remainCnt;
		gradeRemainCnt = gradeRemainCnt === undefined ? 0 : gradeRemainCnt;
		return selectCount < gradeRemainCnt ? selectCount : gradeRemainCnt;
	}

	/**
	 * @description 등급 선택가능 매수 반환
	 * @param {Number} gradeId 등급 id
	 * @return {Number} 선택가능 매수
	 */
	function getSelectCount (gradeId) {
		var isExceptionalLimit = tkPlanState.gradeCountLimitTypeMap[gradeId] === "EXCEPTION";
		var isStandardLimit = tkPlanState.gradeCountLimitTypeMap[gradeId] === "STANDARD";
		// 상품별 매수제어
		var productLimitTotalCount = tkPlanState.limitTotalCount;
		// 등급별 매수제어
		var limitGradeCount = tkPlanState.limitGradeMap[gradeId] === undefined ? 0 : tkPlanState.limitGradeMap[gradeId];


		var returnCount = 0;
		if (isExceptionalLimit) {
			var selectedGradeLimit = scope.selectedLimitGradeMap[gradeId] === undefined ? 0 : scope.selectedLimitGradeMap[gradeId];
			returnCount = tkPlanState.limitGradeMap[gradeId] - selectedGradeLimit;
		} else if (isStandardLimit) {
			var selectedLimitCount = 0;
			// 상품별 매수제어가 등급별 매수제어보다 크면
			if (productLimitTotalCount > limitGradeCount) {
				selectedLimitCount = limitGradeCount;
			} else {
				selectedLimitCount = productLimitTotalCount;
			}

			var selectedStandardGradeCountMap = {};
			var selectedStandardGradeCount = 0;
			var selectedNoneGradeCount = 0;
			var selected = false;
			for (var key in scope.selectedLimitGradeMap) {
				if (tkPlanState.gradeCountLimitTypeMap[key] === "STANDARD" && scope.selectedLimitGradeMap[key] > 0) {
					selected = true;
					selectedStandardGradeCountMap[key] = scope.selectedLimitGradeMap[key];
					selectedStandardGradeCount += scope.selectedLimitGradeMap[key];
				} else {
					selectedNoneGradeCount += scope.selectedLimitGradeMap[key];
				}
			}

			var totalSelctedCount = selectedStandardGradeCount + selectedNoneGradeCount;

			if (selected) {
				var productRemainCount = productLimitTotalCount - totalSelctedCount;
				var gradeRemainCount = selectedLimitCount - (selectedStandardGradeCountMap[gradeId] === undefined ? 0 : selectedStandardGradeCountMap[gradeId]);

				if (gradeRemainCount > productRemainCount) {
					returnCount = productRemainCount;
				} else {
					returnCount = gradeRemainCount;
				}

			} else {
				if (limitGradeCount > productLimitTotalCount - totalSelctedCount) {
					returnCount = productLimitTotalCount - totalSelctedCount;
				} else {
					returnCount = selectedLimitCount - selectedStandardGradeCount;
				}
			}
		} else {
			returnCount = tkPlanState.limitTotalCount - _getTotalCnt();
		}
		return returnCount > 0 ? returnCount : 0;
	}

	/**
	 * @description 사석 설정
	 * @param {Array} deadSeats 사석들
	 */
	function _setDeadSeatMap (deadSeats) {
		scope.deadSeatMap = {};
		_.each(deadSeats, function (deadSeat) {
			var seatId = deadSeat.deadEle.logicalSeatId;
			scope.deadSeatMap[seatId] = tkPlanState.seatMap[seatId];
		});
	}

	/**
	 * @description 선택된 좌석 초기화
	 */
	function _clearSelectedSeats () {
		scope.autoSelectCount = 0;
		scope.hasSelectedSeats = false;
		scope.selectedSeatMap = {};

		_.each(scope.selectedZoneMap, function (selectedZone) {
			selectedZone.count = 0;
		});

		if (!scope.isFailureInPurchaseCountLimit) {
			scope.selectedZoneMap = {};
		}
		scope.isFailureInPurchaseCountLimit = false;
		scope.selectedLimitGradeMap = {};
		scope.deadSeatMap = {};
		tk.event.service.signals.s2u_updatedSelectedSeat.dispatch();
	}

	/**
	 * @description 예매대기 신청된 좌석 그룹 확인
	 * @param {Object} group 선택한 묶음좌석
	 * @return {Boolean} 확인 완료 여부
	 */
	function _isGroupAleradyValidatie (group) {
		var alreadySeats = tk.state.waitingDetail.getAlreadySeats();
		var groupKeys = Object.keys(group);
		for (var i = 0; i < groupKeys.length; i++) {
			if (alreadySeats.indexOf(group[groupKeys[i]].logicalSeatId) !== -1) {
				return false;
			}
		}

		return true;
	}

	return scope;
})();

/**
 * @author donghyun seo
 * @desc 뷰 state
 * @external tk.utils,tk.state.develop, tk.state.plan, tk.state.device, tk.event.service, tk.state.select, tk.i18n.translate
 *
 */

tk.utils.createNamespace("tk.state.view");
tk.state.view = (function () {
	'use strict';

	var scope = {};

	var tkPlanState = tk.state.plan;
	var tkDeviceState = tk.state.device;

	var standByTime = null;

	scope.VIEW_TYPE = {
		MAIN_VIEW: {
			ready: false
		},
		MINIMAP_VIEW: {
			ready: false
		}
	};

	scope.isMobileSeatLayerOpen = true;
	scope.isMobileSelectedSeatLayerOpen = false;
	scope.isMobileZoneLayerOpen = false;

	scope.isTooltipShow = true;

	// Style이 변경되는 DOM
	scope.mainView = null;
	scope.seatInfo = null;
	scope.selectSeatInfo = null;

	scope.isViewOn = _isViewOn;
	scope.isPartView = _isPartView;
	scope.isBgView = _isBgView;
	scope.isAreaView = _isAreaView;
	scope.foldSeatLayerOpen = _foldSeatLayerOpen;
	scope.clearSelectedSeats = _clearSelectedSeats;
	scope.nextStep = _nextStep;
	scope.prevStep = _prevStep;
	scope.setViewTypeReady = _setViewTypeReady;
	scope.isViewTypeReady = _isViewTypeReady;
	scope.getStandByTime = _getStandByTime;
	
	/**
	 * @description 특정 상황에만 뷰를 보이는 것에 대한 처리 (현재 해당 스펙은 아웃)
	 *                * 직접지정만 있는 경우
	 *                * 등급이 선택된 경우
	 *                * 영역이 있는 경우
	 * @return {Boolean} 뷰를 보일 것인지 여부
	 */
	function _isViewOn () {
		if (!tkPlanState.isReady()) {
			return false;
		}

		// var isDirectSelect = tkPlanState.isDirectSelect();
		// var isGradeSelected = tkSelectState.isGradeSelected();
		// return tkPlanState.hasArea || isDirectSelect || isGradeSelected;
		return true;
	}

	/**
	 * @description 현재 뷰가 부분노출 뷰인지 여부 반환
	 * @return {Boolean} 현재 뷰가 부분노출 뷰인지 여부
	 */
	function _isPartView () {
		return tkPlanState.isPartExposure() && TLG.PLAN_STATE === TLG.PLAN_SEAT;
	}

	/**
	 * @description 현재 뷰가 좌석 뷰인지 여부 반환
	 * @return {Boolean} 현재 뷰가 좌석 뷰인지 여부
	 */
	function _isBgView () {
		return !tkPlanState.isPartExposure() && TLG.PLAN_STATE === TLG.PLAN_SEAT;
	}

	/**
	 * @description 현재 뷰가 영역 뷰인지 여부 반환
	 * @return {Boolean} 현재 뷰가 영역 뷰인지 여부
	 */
	function _isAreaView () {
		return TLG.PLAN_STATE === TLG.PLAN_AREA;
	}

	/**
	 * @description 모바일에서 영역 선택시 등급선택 레이어 접음
	 */
	function _foldSeatLayerOpen () {
		if (tkDeviceState.isMobile()) {
			scope.isMobileSeatLayerOpen = false;
		}
	}

	/**
	 * @description 모바일에서 선택 좌석 레이어 접음
	 */
	function _clearSelectedSeats () {
		scope.isMobileSelectedSeatLayerOpen = false;
	}

	/**
	 * @description 다음 단계로 이동
	 * @param {Boolean} isAuto 자동배정 여부
	 */
	function _nextStep (isAuto) {
		try {
			if (window.actionTracer) {
				if (window.actionTracer.sendRepeatClickLog) {
					window.actionTracer.sendRepeatClickLog();
				}
			}
		} catch(e) {
			console.log(e);
		}

		tk.event.service.signals.preOccupancy.dispatch(isAuto);
	}

	/**
	 * @description 이전 단계로 이동
	 */
	function _prevStep () {
		tk.util.reserve.previousStep();
	}

	/**
	 * @description View Type 준비
	 * @param {Object} viewType 뷰 타입
	 */
	function _setViewTypeReady (viewType) {
		switch (viewType) {
			case scope.VIEW_TYPE.MAIN_VIEW:
				scope.VIEW_TYPE.MAIN_VIEW.ready = true;
				break;
			case scope.VIEW_TYPE.MINIMAP_VIEW:
				scope.VIEW_TYPE.MINIMAP_VIEW.ready = true;
				break;
		}

		standByTime = (new Date()).getTime();
	}

	/**
	 * @description View Type 준비 여부
	 * @return {Boolean} View Type 준비 여부
	 */
	function _isViewTypeReady () {
		var ready = true;

		_.each(scope.VIEW_TYPE, function (type) {
			if (!ready || type.ready) {
				return;
			}

			ready = type.ready;
		});

		return ready;
	}

	function _getStandByTime () {
		return standByTime;
	}

	return scope;
})();
/**
 * @author AJu
 * @desc 대기 상세정보 관련 상태
 * @external tk.utils, tk.apis, tk.state.plan, tk.state.global, tk.state.select
 */

tk.utils.createNamespace("tk.state.waitingDetail");
tk.state.waitingDetail = (function () {
  "use strict";
  var scope = {};
  scope.popupShow = {
    reservationType: false, // 대기신청 조건: 유형선택
    gradeType: false, // 대기신청 조건: 등급선택
    reservationTicket: false, // 대기신청 조건: 매수선택
    infomation: true, // 취소표 대기 이용 안내
    paymentRequest: false, // 대기신청 확인 결재하기 정보창
    mobileReservation: false, // 모바일 일괄 팝업
  };
  scope.sectionDimmed = {
    SEAT: true,
    AREA: true,
  };
  var apiManager;
  var tkMetaState;
  var tkPlanState;
  var tkSelectState;

  scope.init = _init;
  scope.startLoading = _startLoading;
  scope.endLoading = _endLoading;
  scope.killAllLoading = _killAllLoading;
  scope.move = _move;
  scope.showPopup = _showPopup;
  scope.closePopup = _closePopup;
  scope.showCountExposure = _showCountExposure;
  scope.showAvailableCountExposure = _showAvailableCountExposure;
  scope.hasSelectedGroup = _hasSelectedGroup;
  scope.selectReservationType = _selectReservationType;
  scope.refreshMainView = _refreshMainView;
  scope.selectTicket = _selectTicket;
  scope.selectGrade = _selectGrade;
  scope.updateCurrentGrade = _updateCurrentGrade;
  scope.getAvailCount = _getAvailCount;
  scope.verifyTicketType = _verifyTicketType;
  scope.getGradesForGradeSelect = _getGradesForGradeSelect;
  scope.getTicketsInfo = _getTicketsInfo;
  scope.isTicketDisable = _isTicketDisable;
  scope.getSectionDimmed = _getSectionDimmed;
  scope.setSectionDimmed = _setSectionDimmed;
  scope.getSchedulesList = _getSchedulesList;
  scope.getAvailGrade = _getAvailGrade;
  scope.getReservationType = _getReservationType;
  scope.getReservationTypeName = _getReservationTypeName;
  scope.isReservationTypeSection = _isReservationTypeSection;
  scope.getNotifyInfo = _getNotifyInfo;
  scope.setNotifyInfo = _setNotifyInfo;
  scope.getMemberName = _getMemberName;
  scope.getPayAmount = _getPayAmount;
  scope.setAlreadySeats = _setAlreadySeats;
  scope.getAlreadySeats = _getAlreadySeats;
  scope.getAlreadyReservedSeats = _getAlreadyReservedSeats;
  scope.getSectionInBlock = _getSectionInBlock;
  scope.selectedSections = _selectedSections;
  scope.selectedSectionsText = _selectedSectionsText;
  scope.isSectionSelectedAll = _isSectionSelectedAll;
  scope.sectionSelectAll = _sectionSelectAll;
  scope.getDefaultBlocks = _getDefaultBlocks;
  scope.setDefaultBlocks = _setDefaultBlocks;
  scope.getReadyForView = _getReadyForView;

  scope.loading = {}; // loading dimming 컨트롤
  scope.data = {};
  scope.waitingDetail = {};
  scope.useGradeSelect = true; // 등급 선택 레이어 노출 여부
  scope.alreadySeats = []; // 이미 신청된 좌석 정보 ID
  scope.alreadyReservedSeats = []; // 이미 예매된 좌석 정보 ID
  scope.defaultBlocks = []; // 최초에 API요청에서 받은 block들
  scope.currentScheduleIndex = null; // 스케쥴 스크롤을 위한 위치값

  scope.isChangeReservationType = true;
  /*==== S: waitingDetail.state Synchronize ====*/
  scope.reservationType = {};
  scope.gradeType = "";
  scope.reservationTicket = "";
  scope.waitingType = "";
  scope.currentGrade = {}; // 선택한 현재 등급
  scope.currentTicketCount = 0; // 햔재 선택한 좌석 갯수
  scope.ticketCount = {
    enable: 0,
    max: 10,
    type: null,
  };
  scope.ticketList = []; // 티켓 숫자 목록
  scope.gradeSelect = []; // 선택 가능 영역들
  scope.verifyTicketCount = {
    // 좌석, 영역 신청 가능 횟수
    seatCnt: {
      cnt: 0,
      type: {
        name: "좌석",
      },
      maxCnt: 0,
    },
    sectionCnt: {
      cnt: 0,
      type: {
        name: "구역",
      },
      maxCnt: 0,
    },
  };
  scope.userMaxTicketCount = 0; // 최대 선택 티켓 수 (선택한 티켓 수 * 10)
  scope.shceduleList = []; // 신청현황 스케쥴 목록
  scope.totalPayAmount = 0; // 총 계산된 값
  scope.totalPayAmountComma = "0"; // 총 계산된 값 Text
  scope.notify = {};
  scope.readyForView = false; // 팝업에 관련된 선택이 완료된 상태 여부
  scope.enableUseSelectGrades = []; // 예외등급 목록
  /*==== E: waitingDetail.state Synchronize ====*/

  function _init(detail) {
    scope.data = detail;
    scope.waitingDetail = detail.waitingDetail;
    scope.useGradeSelect = detail.useGradeSelect;

    if (detail.typeList.length === 2) {
      scope.reservationType = RESERVATION_TYPE.SEAT;
    } else {
      var type = detail.typeList[0].waitingReservationType;
      scope.isChangeReservationType = false;
      scope.reservationType =
        type === "SEAT" ? RESERVATION_TYPE.SEAT : RESERVATION_TYPE.SECTION;
    }

    for (var i = 0; i < detail.typeList.length; i++) {
      var curType = detail.typeList[i].waitingReservationType;
      RESERVATION_TYPE[curType].info = detail.typeList[i];
    }

    apiManager = tk.apis;
    tkMetaState = tk.state.global.meta;
    tkPlanState = tk.state.plan;
    tkSelectState = tk.state.select;

    scope.ticketCount.max = tkMetaState.limit.totalCnt;
  }

  /**
   * @description 로딩 디밍을 위한 key 시작
   * @param {string} loading key
   */
  function _startLoading(apiKey) {
    tk.util.loading.loadingOn();
    scope.loading[apiKey] = false;
  }

  /**
   * @description 로딩 디밍을 위한 key 끝내기
   * @param {string} loading key
   */
  function _endLoading(apiKey) {
    scope.loading[apiKey] = true;

    var keys = Object.keys(scope.loading);
    var isLoadingEnd = keys.every(function (key) {
      return scope.loading[key];
    });

    if (isLoadingEnd) {
      scope.loading = {};
      tk.util.loading.loadingOff();
    }
  }

  /**
   * @description 에러를 위한 모든 로딩 종료
   */
  function _killAllLoading() {
    scope.loading = {};
    tk.util.loading.loadingOff();
  }

  /**
   * @description 선택한 그룹 여부 확인하기
   * @return {boolean}
   */
  function _hasSelectedGroup() {
    return scope.currentGrade.hasOwnProperty("gradeId");
  }

  /**
   * @description 팝업창 타입 선택 후 다음으로 넘기는 함수
   * @param {number} step count
   */
  function _move(step) {
    switch (step) {
      case 0:
        _showPopup(POPUP_TYPE.RESERVATION_TYPE);
        break;
      case 1:
        // showPopup('gradeType');
        _showPopup(
          scope.useGradeSelect
            ? POPUP_TYPE.GRADE_TYPE
            : POPUP_TYPE.RESERVATION_TICKET
        );
        break;
      case 2:
        _showPopup(POPUP_TYPE.RESERVATION_TICKET);
        break;
      case 3:
        scope.popupShow.reservationType = false;
        scope.popupShow.gradeType = false;
        scope.popupShow.reservationTicket = false;
        break;
    }
  }

  function _closePopup(type) {
    if (type === "ALL") {
      scope.popupShow.reservationType = false;
      scope.popupShow.gradeType = false;
      scope.popupShow.reservationTicket = false;
    } else if (type === "MOBILE_RESERVATION") {
      scope.popupShow.mobileReservation = false;
    }

    tk.event.ui.signals.updateWaitingDetail.dispatch({
      popupShow: scope.popupShow,
    });
  }

  function _showPopup(typeObject) {
    var popupType = typeObject.type;
    if (!scope.popupShow.hasOwnProperty(popupType)) {
      return;
    }
    var keys = Object.keys(scope.popupShow);
    var popupGroup = Object.keys(POPUP_TYPE).map(function (type) {
      return POPUP_TYPE[type].type;
    });

    if (popupType === POPUP_TYPE.RESERVATION_TICKET.type) {
      _getAvailCount();
    } else if (popupType === POPUP_TYPE.GRADE_TYPE.type) {
      _getAvailGrade();
    }

    keys.map(function (key) {
      if (popupGroup.indexOf(key) !== -1) {
        scope.popupShow[key] = false;
      }
    });
    scope.popupShow[popupType] = true;
  }

  /**
   * @description 대기표 순번 노출 여부
   * @param {boolean}
   */
  function _showCountExposure() {
    if (scope.data.hasOwnProperty("waitingCountExposureYn")) {
      return scope.data.waitingCountExposureYn;
    }
    return false;
  }

  /**
   * @description 취소표대기 가능 좌석수 노출 여부
   * @param {boolean}
   */
  function _showAvailableCountExposure() {
    if (scope.data.hasOwnProperty("waitingAvailableCountExposureYn")) {
      return scope.data.waitingAvailableCountExposureYn;
    }
    return false;
  }

  /**
   * @description 취소표 방식 선택
   * @param {string}
   * @return {Object} 성공여부
   */
  function _selectReservationType(typeName, ignoreFlag) {
    if (!ignoreFlag) {
      ignoreFlag = false;
    }
    var isVerify = true; // 신청 가능 매소표 여부
    var isMaximum = true;

    var isEnable = true;
    var isChangeType = scope.reservationType.type !== typeName;

    if (typeName === RESERVATION_TYPE.SEAT.type) {
      if (scope.verifyTicketCount.seatCnt.cnt <= 0) {
        isEnable = false;
        isVerify = false;
      }
    } else if (typeName === RESERVATION_TYPE.SECTION.type) {
      if (scope.verifyTicketCount.sectionCnt.cnt <= 0) {
        isEnable = false;
        isVerify = false;
      }
    }

    if (scope.currentTicketCount !== 0) {
      if (
        RESERVATION_TYPE[typeName].info.maxTicketCount <
        scope.currentTicketCount
      ) {
        isEnable = false;
        isMaximum = false;
      }
    }

    if (isChangeType || ignoreFlag) {
      scope.reservationType = RESERVATION_TYPE[typeName];
      scope.ticketCount.max = RESERVATION_TYPE[typeName].info.maxTicketCount;

      // 취소표 방식이 바뀐 경우, 총 티켓값 수정
      var totalPayAmount = 0;
      if (scope.currentTicketCount !== 0) {
        // 총 티켓값
        totalPayAmount =
          scope.reservationType.info.commission * scope.currentTicketCount;
        scope.totalPayAmount = totalPayAmount;
        scope.totalPayAmountComma = tk.Utils.numWithCommas(totalPayAmount);
      }

      tk.event.ui.signals.updateWaitingDetail.dispatch({
        reservationType: scope.reservationType,
        totalPayAmount: scope.totalPayAmount,
        totalPayAmountComma: scope.totalPayAmountComma,
      });
    }

    if ((!isMaximum || !isVerify) && !ignoreFlag) {
      return {
        isVerify: isVerify,
        isMaximum: isMaximum,
        success: false,
      };
      // return false;
    }

    return {
      success: true,
    };
  }

  /**
   * @description 도면 새로고침
   */
  function _refreshMainView(obj) {
    tkSelectState.updateSelectSection([]);
    tk.event.service.signals.s2u_updatedWaitingInfo.dispatch();
    tk.event.service.signals.s2u_updatedSectionInBlock.dispatch({
      isClear: true,
    });
    if (obj.hasOwnProperty("getAvailCount")) {
      if (obj.getAvailCount) {
        _getAvailCount();
      }
    }
  }

  /**
   * @description 선택한 등급
   * @param {object} 선택한 등급
   * @param {object} ajax 옵션
   */
  function _selectGrade(pickGrade) {
    if (pickGrade) {
      scope.currentGrade = pickGrade;

      var productGradeId = 0;
      if (_hasSelectedGroup()) {
        productGradeId = pickGrade.gradeId;
      }

      var gradesLimit = tkMetaState.limit.grades;
      for (var i = 0; i < gradesLimit.length; i++) {
        if (gradesLimit[i].productGradeId === productGradeId) {
          scope.ticketCount.max =
            gradesLimit[i].countLimitType === "NONE"
              ? scope.reservationType.info.maxTicketCount
              : gradesLimit[i].cnt;
          break;
        }
      }

      tk.event.ui.signals.updateWaitingDetail.dispatch({
        currentGrade: scope.currentGrade,
        // ticketCount: scope.ticketCount,
      });
    }
  }

  /**
   * @description 유형 변경시 등급에 있는 값 Sync를 맞추기 위함
   */
  function _updateCurrentGrade() {
    var currentGrade = scope.gradeSelect.find(function (grade) {
      return grade.gradeId === scope.currentGrade.gradeId;
    });
    scope.currentGrade = currentGrade;

    tk.event.ui.signals.updateWaitingDetail.dispatch({
      currentGrade: currentGrade,
    });
  }

  /**
   * @description 선택가능한 티켓 수 업데이트
   */
  function _getAvailCount() {
    var body = {
      productId: tkPlanState.productId,
      waitingReservationType: _getReservationType(),
    };

    if (_hasSelectedGroup()) {
      body.productGradeId = scope.currentGrade.gradeId;
    }

    var verifyCnt =
      scope.getReservationType() === "SEAT"
        ? scope.verifyTicketCount.seatCnt
        : scope.verifyTicketCount.sectionCnt;

    if (verifyCnt.cnt <= 0) {
      var max = scope.ticketCount.max;

      scope.ticketList = [];
      for (var i = 1; i <= max; i++) {
        scope.ticketList.push(i);
      }

      scope.ticketCount = {
        enable: 0,
        max: max,
        type: verifyCnt.type,
      };

      tk.event.ui.signals.updateWaitingDetail.dispatch({
        ticketCount: scope.ticketCount,
        ticketList: scope.ticketList,
      });

      return;
    }

    return apiManager.reservePlan.availCount(body, {
      message: "신청 티켓 갯수 불러오는데 실패하였습니다.",
      timer: false,
      done: function (q, error) {
        /*
					기존 meta 객체 > meta.limit.grades >
					countLimitType != NONE 인경우 일반/예외 등급에 해당
					(이경우 건당 최대매수(=취소표대기 최대매수)는 cnt 값으로 노출)
					 */

        var max = RESERVATION_TYPE[_getReservationType()].info.maxTicketCount;

        scope.ticketList = [];
        for (var i = 1; i <= max; i++) {
          scope.ticketList.push(i);
        }

        scope.ticketCount = {
          enable: q.data.cnt,
          enableCnt: q.data.enableCnt,
          max: max,
          type: q.data.type,
        };

        tk.event.ui.signals.updateWaitingDetail.dispatch({
          ticketCount: scope.ticketCount,
          ticketList: scope.ticketList,
        });
      },
    });
  }

  /**
   * @description 티켓 갯수 선택
   * @param {number}
   */
  function _selectTicket(count) {
    var maxTicketCount = count * 10;

    if (count > 0) {
      if (scope.ticketCount.enable < count) {
        var name = scope.getReservationTypeName();
        alert(
          "신청가능 매수를 초과 선택했습니다.\n해당 " +
            name +
            "의 신청 가능한 잔여 매수는 " +
            scope.ticketCount.enable +
            "매 입니다"
        );
        return false;
      }

      if (scope.ticketCount.enableCnt.indexOf(count) === -1) {
        alert(
          "취소표대기 신청 가능한 좌석/구역이 없습니다.\n필요한 매수를 변경 후 다시 확인 해 주세요."
        );
        return false;
      }

      if (tkSelectState.getTotalCnt() > maxTicketCount) {
        alert(
          "선택된 좌석이 취소표 보다 많습니다.\n(최대 " +
            maxTicketCount +
            "개 선택 가능)"
        );
        return false;
      }
    }

    scope.currentTicketCount = count;
    scope.userMaxTicketCount = maxTicketCount;
    tkPlanState.limitTotalCount = maxTicketCount;

    // 총 티켓값
    var totalPayAmount = scope.reservationType.info.commission * count;
    scope.totalPayAmount = totalPayAmount;
    scope.totalPayAmountComma = tk.Utils.numWithCommas(totalPayAmount);

    tk.event.ui.signals.updateWaitingDetail.dispatch({
      currentTicketCount: count,
      totalPayAmount: scope.totalPayAmount,
      totalPayAmountComma: scope.totalPayAmountComma,
    });
    tk.event.service.signals.s2u_updatedWaitingInfo.dispatch();
    return true;
  }

  /**
   * @description 구매가능 잔여횟수 가져오기
   */
  function _verifyTicketType(option) {
    var body = {
      productId: tkPlanState.productId,
      scheduleId: tkPlanState.schedule.scheduleId,
    };

    return apiManager.reservePlan.verifyCount(body, option);
  }

  /**
   * @description 등급 가져오기
   */
  function _getGradesForGradeSelect() {
    var gradeOpts = {
      message: "예매 등급 정보를 불러오는데 실패하였습니다.",
      timer: false,
      done: function (q, error) {
        if (!error) {
          tkPlanState.setGrades(q.data);
          scope.enableUseSelectGrades = q.data;
        }
        tk.utils.errorNotice(q);
      },
    };
    apiManager.reservePlan.getGrades(gradeOpts);
  }

  /**
   * @description 티켓정보 가져오기
   * @returns {object} tickets info
   */
  function _getTicketsInfo() {
    return {
      currentTicketCount: scope.currentTicketCount,
      userMaxTicketCount: scope.userMaxTicketCount,
    };
  }

  /**
   * @description 티켓정보 is_disabled 여부
   * @param {number} count
   * @returns {object} disable 여부
   */
  function _isTicketDisable(count) {
    if (scope.useGradeSelect) {
      if (scope.currentGrade.hasOwnProperty("validCntList")) {
        if (
          !Array.isArray(scope.currentGrade.validCntList) ||
          scope.currentGrade.validCntList.length === 0
        ) {
          return false;
        }
        return scope.currentGrade.validCntList.indexOf(count) === -1;
      }
      return false;
    }
    return (
      scope.ticketCount.enable < count ||
      scope.ticketCount.enableCnt.indexOf(count) === -1
    );
  }

  function _getSectionDimmed() {
    return scope.sectionDimmed;
  }

  function _setSectionDimmed(type, value) {
    if (scope.sectionDimmed.hasOwnProperty(type)) {
      scope.sectionDimmed[type] = value;
    }
  }

  /**
   * @description 신청현황 날짜 목록 가져오기
   * @returns {object} tickets info
   */
  function _getSchedulesList() {
    var body = {
      productId: tkPlanState.productId,
    };

    apiManager.reservePlan.waitingReservationSchedules(body, {
      message: "신청현황 날짜 목록 가져오는데 실패하였습니다.",
      timer: false,
      done: function (q, error) {
        scope.shceduleList = q.data.map(function (schedule, index) {
          if (tkMetaState.schedule.date === schedule.startDatetime) {
            scope.currentScheduleIndex = index;
          }
          var parsed = scheduleDateParser(schedule.startDatetime);
          schedule.startDate = parsed[0];
          schedule.startDateText = parsed[1];
          return schedule;
        });

        tk.event.ui.signals.updateWaitingDetail.dispatch({
          shceduleList: scope.shceduleList,
        });
      },
    });
  }

  /**
   * @description 신청가능한 등급 가져오기
   * @returns {object} tickets info
   */
  function _getAvailGrade() {
    var body = {
      scheduleId: tkPlanState.schedule.scheduleId,
      productId: tkPlanState.productId,
      memberNo: scope.data.member.memberNo,
      waitingReservationType: _getReservationType(),
    };

    apiManager.reservePlan.waitingReservationGrades(body, {
      message: "신청가능한 등급 목록 가져오는데 실패하였습니다.",
      timer: false,
      done: function (q, error) {
        var grades = tkPlanState.getGrades();

        var gradeSelect = q.data
          .filter(function (validGrade) {
            var grade = findGrade(grades, validGrade);
            return grade !== undefined && grade !== null;
          })
          .map(function (validGrade) {
            var grade = findGrade(grades, validGrade);
            grade.validCntList = validGrade.validCntList;
            return grade;
          });
        scope.gradeSelect = gradeSelect;
        tk.event.ui.signals.updateWaitingDetail.dispatch({
          gradeSelect: scope.gradeSelect,
        });
        _updateCurrentGrade();

        if (gradeSelect.length === 0) {
          alert("취소표대기 신청 가능한 등급이 없습니다.");
        }
      },
    });

    function findGrade(grades, validGrade) {
      return _.find(grades, function (grade) {
        return validGrade.productGradeId === grade.gradeId;
      });
    }
  }

  /**
   * @description 신청현황 날짜 숫자를 날짜로 변환
   * @param {number} Date number
   * @returns {string} Date
   */
  function scheduleDateParser(date) {
    var parsed = [];
    var curDate = new Date(date);
    var dayNumber = curDate.getDay();
    var day = tk.Utils.getDayOfWeek(date);

    var htmlParsed = "";
    htmlParsed += '<span class="number">';
    parsed[0] = "";
    parsed[0] += curDate.getFullYear();
    parsed[0] += ".";
    parsed[0] += tk.Utils.numberZeroFormat(curDate.getMonth() + 1, 2);
    parsed[0] += ".";
    parsed[0] += tk.Utils.numberZeroFormat(curDate.getDate(), 2);
    parsed[0] += "(";
    htmlParsed += parsed[0];
    if (dayNumber === 0 || dayNumber === 6) {
      htmlParsed += '<span class="' + (dayNumber === 0 ? "sun" : "sat") + '">';
      htmlParsed += day;
      htmlParsed += "</span>";
    } else {
      htmlParsed += day;
    }
    parsed[1] = "";
    parsed[1] += day;
    parsed[2] = "";
    parsed[2] += ")";
    parsed[2] += " ";
    parsed[2] += tk.Utils.numberZeroFormat(curDate.getHours(), 2);
    parsed[2] += ":";
    parsed[2] += tk.Utils.numberZeroFormat(curDate.getMinutes(), 2);
    htmlParsed += parsed[2];
    htmlParsed += "</span>";

    return [htmlParsed, parsed.join("")];
  }

  /**
   * @description Reservation Type 가져오기
   * @returns {string} reservationType.type
   */
  function _getReservationType() {
    return scope.reservationType.type;
  }

  /**
   * @description Reservation Type Name 가져오기
   * @returns {string} reservationType.info.waitingReservationTypeName
   */
  function _getReservationTypeName() {
    return scope.reservationType.info.waitingReservationTypeName;
  }

  /**
   * @description Reservation Type이 구역형인가?
   * @returns {boolean} 구역형인지 아닌지 반환
   */
  function _isReservationTypeSection() {
    return scope.reservationType.type === RESERVATION_TYPE.SECTION.type;
  }

  /**
   * @description Notify 정보 가져오기
   * @returns {object} scope.notify
   */
  function _getNotifyInfo() {
    return scope.notify;
  }

  /**
   * @description Notify 정보 업데이트
   * @param {object}
   * 	notifyType: 타입
   * 	notifyInfo: 전화번호 or 이메일
   */
  function _setNotifyInfo(notify) {
    scope.notify = {
      notifyType: notify.notifyType,
      notifyInfo: notify.notifyInfo,
    };
  }

  /**
   * @description Member 이름 정보 가져오기
   * @returns {string} member name
   */
  function _getMemberName() {
    if (scope.data.hasOwnProperty("member")) {
      if (scope.data.member.hasOwnProperty("memberName")) {
        return scope.data.member.memberName;
      }
    }
    return "NO_MEMBER_DATA";
  }

  /**
   * @description Total 계산값 정보 가져오기
   * @returns {number} totalPayAmount
   */
  function _getPayAmount() {
    return scope.totalPayAmount;
  }

  /**
   * @description 이미 신청된 좌석 정보 데이터 갱신
   * @param {array} seatId
   * @returns {book} success
   */
  function _setAlreadySeats(seats) {
    for (var i = 0; i < seats.length; i++) {
      var newSeats = [];
      switch (seats[i].chkType) {
        case "APPLICATION":
          scope.alreadySeats = newSeats.concat(seats[i].logicalSeatIds);
          break;
        case "RESERVE":
          scope.alreadyReservedSeats = newSeats.concat(seats[i].logicalSeatIds);
          break;
      }
    }
    return true;
  }

  /**
   * @description 이미 신청된 좌석 정보 데이터 가져오기
   * @returns {array} seatId
   */
  function _getAlreadySeats() {
    return scope.alreadySeats;
  }

  /**
   * @description 내가 예매한 좌석 정보 가져오기
   * @returns {array} seatId
   */
  function _getAlreadyReservedSeats() {
    return scope.alreadyReservedSeats;
  }

  /**
   * @description 구역 정보 select box format에 맞게 반환
   * @returns {array} Object
   */
  function _getSectionInBlock() {
    var blockInGradeMap = tkPlanState.blockInGradeMap;
    var blockInGradeKeys = Object.keys(blockInGradeMap);
    var grades = tkPlanState.gradeMap;
    var sectionMap = tkPlanState.sectionMap;
    var zoneMap = tkPlanState.zoneMap;
    var zoneMapKeys = Object.keys(zoneMap);

    if (scope.useGradeSelect) {
      if (scope.currentGrade) {
        var curGradeId = scope.currentGrade.gradeId;
        grades = {};
        grades[curGradeId] = scope.currentGrade;
      }
    }

    return blockInGradeKeys
      .filter(function (grade) {
        // 존재하는 영역만 필터링
        return grades[grade];
      })
      .map(function (grade) {
        var gradeId = parseInt(grade, 10);
        var gradeMap = grades[grade];
        var sections = [];

        if (!blockInGradeMap[grade]) {
          return;
        }
        if (blockInGradeMap[grade].length === 0) {
          return;
        }
        if (gradeMap === undefined) {
          return;
        }

        blockInGradeMap[grade].map(function (block) {
          var section = sectionMap[block.sectionId];

          var newSection = {
            sectionId: block.sectionId,
            blockId: block.blockId,
            remainCnt: block.remainCnt,
            waitingCnt: block.waitingCnt,
            selected: false,
            disabled: scope.currentTicketCount > block.remainCnt,
          };

          var hasData = false;

          if (section) {
            hasData = true;
            newSection.type = "SECTION";
            newSection.name = section.sectionName;
          } else {
            var currentZone = null;
            for (var i = 0; i < zoneMapKeys.length; i++) {
              var zone = zoneMap[zoneMapKeys[i]];
              var isCurrentBlock = false;
              if (zone.hasOwnProperty("blockId")) {
                isCurrentBlock = zone.blockId === block.blockId;
              } else {
                isCurrentBlock = zone.logicalZoneId === block.blockId;
              }

              if (isCurrentBlock && zone.gradeId === gradeId) {
                currentZone = zone;
                break;
              }
            }
            if (currentZone) {
              hasData = true;
              newSection.type = "ZONE";
              newSection.name = zone.zoneName;
              newSection.zone = currentZone;
            }
          }

          if (!hasData) {
            return;
          }

          sections.push(newSection);
        });

        sections.sort(function (a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        return {
          gradeId: gradeMap.gradeId,
          name: gradeMap.name,
          color: gradeMap.color,
          sections: sections,
          selected: false,
        };
      });
  }

  /**
   * @description 선택된 구역반환
   * @return {array} 선택된 구역
   */
  function _selectedSections(sectionInBlocks) {
    if (!Array.isArray(sectionInBlocks)) {
      return [];
    }
    if (sectionInBlocks.length === 0) {
      return [];
    }

    var filterdSectionInBlocks = sectionInBlocks
      .map(function (block) {
        var newBlock = JSON.parse(JSON.stringify(block));
        newBlock.sections = block.sections.filter(function (section) {
          return section.selected;
        });
        return newBlock;
      })
      .filter(function (block) {
        return block.sections.length !== 0;
      });

    return filterdSectionInBlocks;
  }

  /**
   * @description 선택된 구역 Text반환
   * @return {string} 선택된 구역
   */
  function _selectedSectionsText(filterdSectionInBlocks) {
    if (!Array.isArray(filterdSectionInBlocks)) {
      return "";
    }
    if (filterdSectionInBlocks.length === 0) {
      return "";
    }

    return filterdSectionInBlocks
      .map(function (block) {
        var blockName = block.name;
        var sections = block.sections
          .map(function (section) {
            return blockName + "-" + section.name;
          })
          .join(", ");
        return sections;
      })
      .join(", ");
  }

  /**
   * @description 선택된 구역이 모두 선택 되었는지 여부 판단
   * @return {boolean} 체크 여부
   */
  function _isSectionSelectedAll(sectionInBlocks) {
    if (!Array.isArray(sectionInBlocks)) {
      return false;
    }
    if (sectionInBlocks.length === 0) {
      return false;
    }

    return sectionInBlocks.every(function (block) {
      return block.sections.every(function (section) {
        if (section.disabled) {
          return true;
        }
        return section.selected;
      });
    });
  }

  /**
   * @description 구역들 전체 선택
   * @return {array} 선택한 구역들 반환
   */
  function _sectionSelectAll(sectionInBlocks, isAllSelect) {
    if (!Array.isArray(sectionInBlocks)) {
      return [];
    }
    if (sectionInBlocks.length === 0) {
      return [];
    }
    return sectionInBlocks.map(function (block) {
      block.sections = block.sections.map(function (section) {
        if (!section.disabled) {
          section.selected = isAllSelect;
        }
        return section;
      });
      return block;
    });
  }

  /**
   * @description 이미 신청된 좌석 정보 데이터 가져오기
   * @returns {array} seatId
   */
  function _getAlreadySeats() {
    return scope.alreadySeats;
  }

  /**
   * @description 최초에 API요청으로 받았던 블럭정보 가져오기
   * @returns {array} block
   */
  function _getDefaultBlocks() {
    return scope.defaultBlocks;
  }

  /**
   * @description 최초에 API요청으로 받았던 블럭정보 설정하기
   * @param {array} blocks
   * @returns {boolean} 성공여부
   */
  function _setDefaultBlocks(blocks) {
    if (!blocks) {
      return false;
    }

    if (!Array.isArray(blocks)) {
      return false;
    }

    scope.defaultBlocks = blocks;
    return true;
  }

  /**
   * @description 취소표대기 최초 팝업 선택이 끝났는지 여부값 반환
   * @returns {boolean} 성공여부
   */
  function _getReadyForView() {
    return scope.readyForView;
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc 사석 룰
 * @external tk.utils
 */

tk.utils.createNamespace("tk.controller.deadSeat.rules");
tk.controller.deadSeat.rules = (function () {
	'use strict';

	var scope = {};

	scope.RULES = {
		ONE: {rule: rule1, orderBy: 3},
		TWO: {rule: rule2, orderBy: 2},
		THREE: {rule: rule3, orderBy: 1}
	};

	/**
	 * @description Rule1 : 한 행의 연속된 좌석에서 2석 이상 선택 시 '좌/우, 중간' 1석만 남는 경우 (열은 여러 열을 적용해도 무관)
	 * @param {Object} deadSeat 체크할 사석 객체
	 * @return {Object} 체크한 사석 정보
	 */
	function rule1 (deadSeat) {
		var linkedSeats = deadSeat.linkedSeats;
		var linkedSeatsSize = deadSeat.linkedSeats.length;

		for (var idx = 0; idx < linkedSeatsSize; idx++) {
			//좌측체크
			if (idx === 0 && linkedSeats[idx].able && !linkedSeats[idx + 1].able) {
				var deadEle = linkedSeats[idx];
				return {
					isDead: true,
					deadEle: deadEle,
					msg: tk.i18n.translate.getTranslate("alert.seatzone.deatseat.leftorright")
				};
			}

			//연석체크
			if (idx > 0 && idx < linkedSeatsSize - 1 && !linkedSeats[idx - 1].able && linkedSeats[idx].able && !linkedSeats[idx + 1].able
			) {
				var deadEle = linkedSeats[idx];
				return {
					isDead: true,
					deadEle: deadEle,
					msg: tk.i18n.translate.getTranslate("alert.seatzone.deatseat.seat.together")
				};
			}

			// 우측 체크
			if (idx === linkedSeatsSize - 1 && linkedSeats[idx].able && !linkedSeats[idx - 1].able) {
				var deadEle = linkedSeats[idx];
				return {
					isDead: true,
					deadEle: deadEle,
					msg: tk.i18n.translate.getTranslate("alert.seatzone.deatseat.leftorright")
				};
			}
		}

		return {
			isDead: false,
			deadEle: null,
			msg: null
		};
	}


	/**
	 * @description Rule1 이 반드시 선행되어야 한다.
	 *                Rule2 : 한 행의 연속된 좌석 최대수가 N일 경우 N-1석 선택 시, '좌/우' 1석만 남는 경우는 가능. 단, 중간 1석만 남는 경우 불가
	 * @param {Object} deadSeat 체크할 사석 객체
	 * @return {Object} 체크한 사석 정보
	 */
	function rule2 (deadSeat) {
		var linkedSeats = deadSeat.linkedSeats;
		var linkedSeatsSize = linkedSeats.length;
		var disabledCnt = deadSeat.disabledCnt;

		// rule1 을 선행 검사한다.
		var requireResult = rule1(deadSeat);
		if (!requireResult.isDead) {
			return requireResult;
		}

		if (linkedSeatsSize - 1 === disabledCnt) { // N-1석 선택 시
			if (linkedSeats[0].able || linkedSeats[linkedSeatsSize - 1].able) { // 좌/우 1석만 남은 경우
				return {
					isDead: false,
					deadEle: null,
					msg: null
				};
			}
		}
		return requireResult;
	}

	/**
	 * @description Rule2 가 반드시 선행되어야 한다.
	 *                Rule3 : 한 행의 연속된 좌석최대 수가 2일 경우 1명 예매 불가 (ex. 두 자리만 있는 경우 1명 앉기 불가. 사석처리)
	 * @param {Object} deadSeat 체크할 사석 객체
	 * @return {Object} 체크한 사석 정보
	 */
	function rule3 (deadSeat) {
		var linkedSeats = deadSeat.linkedSeats;
		var linkedSeatsSize = deadSeat.linkedSeats.length;
		var disabledCnt = deadSeat.disabledCnt;
		var abledCnt = deadSeat.abledCnt;

		// rule2 를 선행 검사한다.
		var requireResult = rule2(deadSeat);
		if (requireResult.isDead) {
			return requireResult;
		}

		if (linkedSeatsSize !== 2 || // 좌석이 2석이 아니거나
			linkedSeatsSize === abledCnt || //2 석 모두 안된 경우
			linkedSeatsSize === disabledCnt) { //2 석 모두 선택된 경우
			return requireResult;
		}

		// 좌우측 사석 여부
		if (linkedSeats[0].able) { // 좌측 사석
			var deadEle = linkedSeats[0];
			return {
				isDead: true,
				deadEle: deadEle,
				msg: tk.i18n.translate.getTranslate("alert.seatzone.deatseat.leftorright")
			};
		} else { // 우측 사석
			var deadEle = linkedSeats[1];
			return {
				isDead: true,
				deadEle: deadEle,
				msg: tk.i18n.translate.getTranslate("alert.seatzone.deatseat.leftorright")
			};
		}
	}

	return scope;
})();

/**
 * @author donghyun seo
 * @desc 사석 객체
 * @external tk.utils
 */

tk.utils.createNamespace("tk.controller.deadSeat.deadSeat");
tk.controller.deadSeat.deadSeat = (function () {
	'use strict';

	var scope = {};

	scope.DeadSeat = DeadSeat;

	/**
	 * @description 사석 객체
	 * @see {@link http://wiki.nhnent.com/pages/viewpage.action?pageId=249198594|사석 제어}
	 * @param {Array} linkedSeats 연석
	 * @param {Array} rules 적용할 사석 룰
	 */
	function DeadSeat (linkedSeats, rules) {
		var scope = this;
		scope.linkedSeats = linkedSeats;
		scope.rules = rules;
		scope.abledCnt = 0;
		scope.disabledCnt = 0;

		_.each(scope.linkedSeats, function (linkedSeat) {
			if (linkedSeat.able) {
				scope.abledCnt++;
			} else {
				scope.disabledCnt++;
			}
		});

		scope.validSeatDead = _validSeatDead;

		/**
		 * @description 사석 체크
		 */
		function _validSeatDead () {
			var notDeadResult = {isDead: false, deadEle: null, msg: null};
			// 좌석 개수가 2개 미만인 경우는 사석 제외
			if (scope.linkedSeats.length < 2) {
				return notDeadResult;
			}

			// 사석제어 룰이 없는 경우
			if (!scope.rules) {
				return notDeadResult;
			}

			var sortedRules = _.sortBy(scope.rules, "orderBy");

			// 정렬된 룰들을 돌아가며 사석 체크(버그 발견)
			// for (var idx = 0; idx < sortedRules.length; idx++) {
			// 	var deadResult = sortedRules[idx].rule(scope);
			// 	if (!deadResult.isDead) {
			// 		return deadResult;
			// 	}
			// }

			// 가장 상위의 조건의 사석을 체크하면 하위도 체크됨
			if (sortedRules.length > 0) {
				return sortedRules[0].rule(scope);
			}
			return notDeadResult;
		}
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 사석 컨트롤러
 * @external tk.utils, tk.state.plan, tk.state.select, tk.controller.deadSeat.deadSeat, tk.controller.deadSeat.rules
 */

tk.utils.createNamespace("tk.controller.deadSeat.deadSeatController");
tk.controller.deadSeat.deadSeatController = (function () {
	'use strict';

	var scope = {};

	var tkPlanState = tk.state.plan;
	var tkSelectState = tk.state.select;

	var DeadSeat = tk.controller.deadSeat.deadSeat.DeadSeat;
	var RULES = tk.controller.deadSeat.rules.RULES;

	scope.DEAD_SEAT_TYPE = {
		AVAIL: 0,
		SOLD: 1,
		SELECT: 2
	};

	scope.getLinkedSeatsList = getLinkedSeatsList;
	scope.getDeadSeats = getDeadSeats;
	scope.getDeadSeatsAboutSelectedSeat = getDeadSeatsAboutSelectedSeat;

	/**
	 * @description 사석을 체크하기 위한 연석 리스트 반환
	 * @param {Array} rowLinkedSeats 연석
	 * @return {Array} 사석을 체크하기 위한 연석 반환
	 */
	function getLinkedSeatsList (rowLinkedSeats) {
		var linkedSeatsList = [];
		var linkedSeats = null;
		for (var i = 0; i < rowLinkedSeats.length; i++) {
			linkedSeats = [];

			for (var j = i; j < rowLinkedSeats.length; j++) {
				var seat = rowLinkedSeats[j];

				// 좌석이 없거나 판매된 경우, 다음 좌석은 새로운 연석으로 취급
				if (!seat || isSeatSold(seat)) {
					i = j;
					linkedSeatsList.push(linkedSeats);
					break;
				}

				linkedSeats.push({logicalSeatId: seat.logicalSeatId, able: seat.type === scope.DEAD_SEAT_TYPE.AVAIL});

				// 다음 좌석의 등급이 다를 경우, 다음 좌석은 새로운 연석으로 취급
				if (isNextGradeDiff(rowLinkedSeats, j)) {
					i = j;
					linkedSeatsList.push(linkedSeats);
					break;
				}

				// 다음 좌석의 판매순서가 1보다 큰지 확인, 크다면 다음 좌석은 새로운 연석으로 취급(할당처가 다른 경우)
				if (isNextOrderDiff(rowLinkedSeats, j)) {
					i = j;
					linkedSeatsList.push(linkedSeats);
					break;
				}

				// 마지막 좌석
				if (j === rowLinkedSeats.length - 1) {
					linkedSeatsList.push(linkedSeats);
					return linkedSeatsList;
				}
			}
		}
		return linkedSeatsList;
	}

	/**
	 * @description 좌석의 판매 여부 반환
	 * @param {Object} seat 좌석
	 * @return {Boolean} 좌석의 판매 여부
	 */
	function isSeatSold (seat) {
		return seat.type === scope.DEAD_SEAT_TYPE.SOLD;
	}

	/**
	 * @description 이후 좌석이 등급이 다른지 여부 반환
	 * @param {Array} seats 연석
	 * @param {Number} index 확인할 index
	 * @return {Boolean} 이후 좌석이 등급이 다른지 여부
	 */
	function isNextGradeDiff (seats, index) {
		// 마지막 좌석인 경우
		if (index >= seats.length - 1) {
			return false;
		}

		var seat = tkPlanState.seatMap[seats[index].logicalSeatId];
		var nextSeat = tkPlanState.seatMap[seats[index + 1].logicalSeatId];

		// 다음 좌석이 없는 경우
		if (!seat || !nextSeat) {
			return false;
		}

		return seat.gradeId !== nextSeat.gradeId;
	}

	/**
	 * @description 이후 좌석이 판매순서 1보다 큰지 반환
	 * @param {Array} seats 연석
	 * @param {Number} index 확인할 index
	 * @return {Boolean} 이후 좌석이 판매순서 1보다 큰지 여부
	 */
	function isNextOrderDiff (seats, index) {
		if (index >= seats.length - 1) {
			return false;
		}

		var seat = seats[index];
		var nextSeat = seats[index + 1];

		if (!seat || !nextSeat) {
			return false;
		}

		return seat.orderNum + 1 !== nextSeat.orderNum;
	}

	/**
	 * @description 확인된 사석 반환
	 * @param {Array} rules 확인할 사석 룰
	 * @param {Array} rowLinkedSeats 확인할 연석
	 * @return {Array} 확인된 사석들
	 */
	function getDeadSeats (rules, rowLinkedSeats) {
		var linkedSeatsList = scope.getLinkedSeatsList(rowLinkedSeats);
		var deadSeats = [];

		_.each(linkedSeatsList, function (linkedSeats) {
			var deadSeatResult = new DeadSeat(linkedSeats, rules).validSeatDead();

			// 사석이 발생한 경우 사석 리스트에 추가
			if (deadSeatResult && deadSeatResult.isDead) {
				deadSeats.push(deadSeatResult);
			}
		});
		return deadSeats;
	}

	/**
	 * @description 선택된 좌석에 대한 사석 체크
	 * @return {Array} 선택된 좌석에 대한 사석들
	 */
	function getDeadSeatsAboutSelectedSeat () {
		var selectedSeats = tkSelectState.getSelectSeats();
		var deadSeats = [];
		var blockRowListAboutSelectedSeats;

		if (selectedSeats.length < 0) {
			return deadSeats;
		}

		blockRowListAboutSelectedSeats = getBlockLinkedRowListAboutSelectedSeats(selectedSeats);
		_.each(blockRowListAboutSelectedSeats, function (row) {
			// 확인할 연석에 대한 사석 룰 획득
			var firstExistSeat = _.find(row, function (seat) {
				return seat !== undefined;
			});

			if (firstExistSeat === undefined) {
				return;
			}

			var rules = getRules(firstExistSeat.logicalSeatId);

			// 확인된 사석들을 하나의 리스트로 연결
			var deadSeatsForRow = scope.getDeadSeats(rules, row);
			if (deadSeatsForRow.length) {
				deadSeats = deadSeats.concat(deadSeatsForRow);
			}
		});
		tkSelectState.setDeadSeatMap(deadSeats);
		return deadSeats;
	}

	/**
	 * @description 사석을 확인할 선택된 좌석에 대한 연석 객체를 반환
	 * @param {Array} selectedSeats 사석을 확인할 선택된 좌석
	 * @return {Object} 사석을 확인할 선택된 좌석에 대한 연석 객체
	 */
	function getBlockLinkedRowListAboutSelectedSeats (selectedSeats) {
		var blockLinkedRowListAboutSelectedSeats = {};
		for (var idx = 0; idx < selectedSeats.length; idx++) {
			var seat = selectedSeats[idx];

			// 연석 정보나 판매 정보가 없는 경우 무시
			if (seat.linkedId < 1 || seat.orderNum < 1) {
				continue;
			}

			var key = generateKey(seat.blockId, seat.linkedId);
			var row = blockLinkedRowListAboutSelectedSeats[key];
			if (!row) {
				row = getLinkedRow(seat.blockId, seat.linkedId);
				blockLinkedRowListAboutSelectedSeats[key] = row;
			}

			_.each(row, function (col) {
				if (col.logicalSeatId === seat.logicalSeatId) {
					col.type = scope.DEAD_SEAT_TYPE.SELECT;
				}
			});
		}
		return blockLinkedRowListAboutSelectedSeats;
	}

	/**
	 * @description 선택된 좌석에 대한 열 리스트의 키 반환
	 * @param {Number} blockId 영역 Id
	 * @param {Number} linkedId 연석 Id
	 * @return {String} 선택된 좌석에 대한 열 리스트의 키
	 */
	function generateKey (blockId, linkedId) {
		return blockId + ":" + linkedId;
	}

	/**
	 * @description 선택된 좌석에 대한 열 반환
	 * @param {Number} blockId 영역 Id
	 * @param {Number} linkedId 연석 Id
	 * @return {Array} 선택된 좌석에 대한 열
	 */
	function getLinkedRow (blockId, linkedId) {
		var row = tkPlanState.blockLinkedMap[blockId][linkedId];

		if (!row) {
			return [];
		}

		var rowAboutSelectedSeats = [];

		_.each(row, function (col) {
			if (col === undefined) {
				return;
			}
			rowAboutSelectedSeats.push({
				logicalSeatId: col.logicalSeatId,
				orderNum: col.orderNum,
				type: getType(col)
			});
		});

		return _.sortBy(rowAboutSelectedSeats, "orderNum");
	}

	/**
	 * @description 사석 타입 반환
	 * @param {Object} seat 좌석
	 * @return {Number} 사석 타입
	 */
	function getType (seat) {
		if (tkPlanState.seatSoldMap[seat.logicalSeatId]) { // 좌석이 판매된 경우
			return scope.DEAD_SEAT_TYPE.SOLD;
		} else {
			return scope.DEAD_SEAT_TYPE.AVAIL;
		}
	}

	/**
	 * @description 해당 연석에 대한 사석 룰 반환(같은 연석내 좌석은 같은 룰을 적용한다고 가정)
	 * @param {Object} logicalSeatId 좌석 id
	 * @return {Array} 사석 룰
	 */
	function getRules (logicalSeatId) {
		var seat = tkPlanState.seatMap[logicalSeatId];
		var rules = [];
		var deadSeatConditions = [];

		if (!seat) {
			return [];
		}

		var block = tkPlanState.blockMap[seat.blockId];

		// 영역 안에 있는 사석룰을 확인해서 가져옴
		if (block && Array.isArray(block.grades) && block.grades.length > 0) {
			var grade = _.find(block.grades, function (gradeInBlock) {
				return gradeInBlock.gradeId === seat.gradeId;
			});
			deadSeatConditions = grade.deadSeatConditions;
		}

		// 문자열로 온 사석 Enum 을 실제 Enum 으로 변환
		if (deadSeatConditions.length !== 0) {
			_.each(deadSeatConditions, function (deadSeatCondition) {
				rules.push(RULES[deadSeatCondition]);
			});
		}

		return rules;
	}

	return scope;
})();

/**
 * @author donghyun seo
 * @desc 데이터 관련 컨트롤러
 * @external tk.utils, tk.apis, tk.event.service, tk.state.plan, tk.state.select, tk.state.device, tk.view.state, tk.state.develop,
 * tk.state.waitingDetail, tk.state.global.meta
 * tk.controller.deadSeat.deadSeatController, tk.i18n.translate
 */

tk.utils.createNamespace('tk.controller.data');
tk.controller.data = (function () {
  'use strict';

  var scope = {};

  var apiManager = tk.apis;
  var tkPlanState = tk.state.plan;
  var tkSelectState = tk.state.select;
  var tkViewState = tk.state.view;
  var tkWaitingDetailState = tk.state.waitingDetail;
  var tkLoading = tk.util.loading;

  var refreshTime = 1000;
  var updateReservationData = _.throttle(_updateReservationData, refreshTime);
  var updateReservationSeatData = _.throttle(_updateReservationSeatData, refreshTime);
  var isUpdateSeatWaitingLinked = false; // 새로고침시에만 호출 되도록 수정

  tk.event.service.signals.updateReservationData.add(updateReservationData);
  tk.event.service.signals.updateReservationSeatData.add(updateReservationSeatData);
  tk.event.service.signals.updateReservationSeatDataByArea.add(updateReservationSeatDataByArea);
  tk.event.service.signals.updateReservationSeatDataByAreaWithKey.add(updateReservationSeatDataByAreaWithKey);
  tk.event.service.signals.updateReservationSeatDataByBlock.add(updateReservationSeatDataByBlock);
  tk.event.service.signals.updateReservationSeatDataBySector.add(updateReservationSeatDataBySector);
  tk.event.service.signals.updateAllCanvasByArea.add(updateAllCanvasByArea);
  tk.event.service.signals.updateAllCanvasByAreaWithKeys.add(updateAllCanvasByAreaWithKeys);
  tk.event.service.signals.updateAllCanvasByBlock.add(updateAllCanvasByBlock);
  tk.event.service.signals.updateAllCanvasByBlockArea.add(updateAllCanvasByBlockArea);
  tk.event.service.signals.updateSeatSoldoutByArea.add(updateSeatSoldoutByArea);
  tk.event.service.signals.updateSeatSoldoutByAreaWithKeys.add(updateSeatSoldoutByAreaWithKeys);
  tk.event.service.signals.updateSeatSoldoutByBlock.add(updateSeatSoldoutByBlock);
  tk.event.service.signals.preOccupancy.add(preOccupancy);
  tk.event.service.signals.updateSeatWaitingLinked.add(updateSeatWaitingLinkedForRefresh);

  /**
   * @description 예매 정보 갱신
   */
  function _updateReservationData() {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Reservation Data');

    var apis = [];
    tk.event.service.signals.s2u_gradeLoadingToggle.dispatch(true);

    var gradeOpts = {
      message: '예매 등급 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        if (!error) {
          tkPlanState.setGrades(q.data);
        }
        tk.utils.errorNotice(q);
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    var gradeBlockOpts = {
      message: '예매 등급-영역 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        if (!error) {
          var blocks = q.data;

          // [예매대기전용] 선택된 등급만 보여주기
          if (tk.utils.isWaitingReservation()) {
            if (blocks) {
              tkWaitingDetailState.enableUseSelectGrades = blocks;
              if (tkWaitingDetailState.useGradeSelect) {
                var currentGrade = tkWaitingDetailState.currentGrade;
                blocks = blocks.filter(function (block) {
                  return currentGrade.gradeId === block.gradeId;
                });
              }

              var filteredBlock = blocks.filter(function (block) {
                return block.remainCnt >= tkWaitingDetailState.currentTicketCount;
              });
              tkWaitingDetailState.setDefaultBlocks(filteredBlock);
              tkSelectState.setSelectedBlocks(filteredBlock);
            }
          }

          tkPlanState.setGradesInBlock(blocks);
        }
        tk.utils.errorNotice(q);
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // 등급
    if (tk.state.plan.isApiLoadRequire.grade) {
      apis.push(apiManager.reservePlan.getGrades(gradeOpts).$promise);
    } else {
      tk.state.plan.isApiLoadRequire.grade = true;
    }

    /*** 영역 내 등급 가져오기 flag ***/
    var isCallGetGradeInBlock = false;
    if (tkPlanState.hasArea) {
      isCallGetGradeInBlock = true;
    }

    if (tk.utils.isWaitingReservation()) {
      if (tkWaitingDetailState.getReservationType() === 'SECTION') {
        isCallGetGradeInBlock = true;
      }
    }

    // 영역 내 등급
    if (isCallGetGradeInBlock) {
      apis.push(apiManager.reservePlan.getGradesInBlock(gradeBlockOpts).$promise);
    }

    var isGetZoneRemain = true;

    // 비지정석 남은 좌석
    if (isGetZoneRemain) {
      var zoneOpts = {
        message: '예매 비지정 정보를 불러오는데 실패하였습니다.',
        timer: false,
        done: function (q, error) {
          if (!error) {
            if (tk.utils.isWaitingReservation()) {
              if (tk.state.waitingDetail.useGradeSelect) {
                /* S: 비지정석 필터링 */
                var currentGrade = tk.state.waitingDetail.currentGrade;
                var zoneSoldOutObject = q.data.map(function (zone) {
                  var returnZone = {};
                  returnZone.logicalZoneId = zone.logicalZoneId;
                  returnZone.waitingCnt = zone.waitingCnt;
                  if (tk.state.plan.zoneMap[zone.logicalZoneId].gradeId === currentGrade.gradeId) {
                    returnZone.remainCnt = zone.remainCnt;
                  } else {
                    returnZone.remainCnt = null;
                  }
                  return returnZone;
                });
                return tkPlanState.setZoneSoldMap(zoneSoldOutObject);
                /* E: 비지정석 필터링 */
              }
            }
            return tkPlanState.setZoneSoldMap(q.data);
          }
          tk.utils.errorNotice(q);
        },
        fail: function (kill, message) {
          alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
          tkWaitingDetailState.killAllLoading();
          tk.event.service.signals.refreshMainView.dispatch();
        }
      };

      apis.push(apiManager.reservePlan.getZoneRemain(zoneOpts).$promise);
    }

    // [예매대기전용]
    if (tk.utils.isWaitingReservation()) {
      if (tk.state.global.meta.frontPlanTypeCode === 'WAITING_APPLICATION') {
        var already = {
          message: '이미 신청된 좌석을 불러올 수 없습니다.',
          timer: false,
          done: function (q, error) {
            if (!error) {
              tkWaitingDetailState.setAlreadySeats(q.data);
            }
            tk.utils.errorNotice(q);
          },
          fail: function (kill, message) {
            alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
            tkWaitingDetailState.killAllLoading();
            tk.event.service.signals.refreshMainView.dispatch();
          }
        };
        apis.push(apiManager.reservePlan.waitingAlreadySeats(already).$promise);
      }
    }

    startWaitingLoading('updateReservationData');

    return tk.utils.getPromiseAll(apis).done(function () {
      tk.event.service.signals.s2u_gradeLoadingToggle.dispatch(false);
      tk.event.service.signals.updatedReservationData.dispatch();
      tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Reservation Data');
      endWaitingLoading('updateReservationData');
    });
  }

  /**
   * @description 예매 좌석 정보 갱신
   * @param {Boolean} isZoneUpdate 비지정 정보 갱신 여부(updateReservationData 와 같이 쓸 경우)
   */
  function _updateReservationSeatData(isZoneUpdate) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Reservation Seat Data');

    tkSelectState.clearSelectedSeats();

    // 좌석 판매 로드 초기화
    _.each(tkPlanState.pagingLoadSoldoutMap, function (value, key) {
      tkPlanState.pagingLoadSoldoutMap[key] = false;
    });

    // 영역 로드 초기화
    tkPlanState.blockLoadSoldoutMap = {};

    // 페이징 호출 맵 초기화
    _.each(tkPlanState.pagingCallMap, function (value, key) {
      tkPlanState.pagingCallMap[key] = false;
    });

    // 영역 페이징 호출 맵 초기화
    _.each(tkPlanState.blockCallMap, function (value, key) {
      tkPlanState.blockCallMap[key] = false;
    });

    // 도면 초기화 --------------------------------------------------
    TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
    TLSVGMatrixInfo.getInstance().pagingSectorDetection();
    //--------------------------------------------------------------

    tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Reservation Seat Data');
  }

  /**
   * @description 예매 그리드 좌석 정보 갱신
   * @param {Object} seatGridIndexes 좌석 그리드 인덱스
   */
  function updateReservationSeatDataByArea(seatGridIndexes) {
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.DATA,
      '[Data] Update Reservation Seat Data By Area'
    );
    var isWaitingReservation = tk.utils.isWaitingReservation();
    var apis = [];
    var promise;

    // 좌석 정보 호출
    promise = updateAllCanvasByArea(seatGridIndexes);
    if (promise) {
      apis.push(promise.$promise);
    }

    // 판매 좌석 정보 호출
    promise = updateSeatSoldoutByArea(seatGridIndexes);
    if (promise) {
      apis.push(promise.$promise);
    }

    startWaitingLoading('updateReservationSeatDataByArea');

    // 두 API 호출이 완료된 후 호출
    tk.utils.getPromiseAll(apis).done(function () {
      var returnData = {};

      // 이미 받은 paging 정보도 호출하기 위한 처리
      for (var x = seatGridIndexes.startX; x <= seatGridIndexes.endX; x++) {
        for (var y = seatGridIndexes.startY; y <= seatGridIndexes.endY; y++) {
          var key = generateSeatGridKey(x, y);
          var paging = tkPlanState.pagingMap[key];
          if (!paging) {
            continue;
          }
          returnData[key] = paging;
        }
      }

      if (isWaitingReservation) {
        tkPlanState.filteredSeatSoldMap();
      }

      tk.event.service.signals.updatedReservationSeatDataByArea.dispatch(returnData);
      tk.state.develop.debugTimeEnd(
        tk.state.develop.DEBUG_TIME_TYPE.DATA,
        '[Data] Update Reservation Seat Data By Area'
      );

      endWaitingLoading('updateReservationSeatDataByArea');
    });
  }

  /**
   * @description 예매 그리드 좌석 정보 갱신 (key에 의해서)
   * @param {Array} keys 호출할 key 들
   */
  function updateReservationSeatDataByAreaWithKey(keys) {
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.DATA,
      '[Data] Update Reservation Seat Data By Area With Key'
    );
    var apis = [];
    var promise;

    // 좌석 정보 호출
    promise = updateAllCanvasByAreaWithKeys(keys);
    if (promise) {
      apis.push(promise.$promise);
    }

    // 판매 좌석 정보 호출
    promise = updateSeatSoldoutByAreaWithKeys(keys);
    if (promise) {
      apis.push(promise.$promise);
    }

    if (isUpdateSeatWaitingLinked) {
      promise = updateSeatWaitingLinked();
      if (promise) {
        apis.push(promise.$promise);
      }
      isUpdateSeatWaitingLinked = false;
    }

    startWaitingLoading('updateReservationSeatDataByAreaWithKey');

    // 두 API 호출이 완료된 후 호출
    tk.utils.getPromiseAll(apis).done(function () {
      if (tk.utils.isWaitingReservation()) {
        var isSection = tk.state.waitingDetail.getReservationType() === 'SECTION';
        var seatSoldOutObject = {};

        // seatSoldMap에서 보여지는 좌석을 필터링
        var seats = Object.keys(tkPlanState.seatSoldMap)
          .filter(function (seatId) {
            return tkPlanState.seatSoldMap[seatId] === false;
          })
          .map(function (seatId) {
            return tkPlanState.seatMap[seatId];
          });

        if (tk.state.waitingDetail.useGradeSelect) {
          var currentGrade = tk.state.waitingDetail.currentGrade;

          // waitingLinkedMap에서 gradeId가 같은 좌석 필터링
          var linkedMap = tkPlanState.blockWaitingLinkedMap;
          var linkKeys = Object.keys(linkedMap).filter(function (linkKey) {
            var seatKeys = Object.keys(linkedMap[linkKey]);
            return seatKeys.every(function (seatKey) {
              return linkedMap[linkKey][seatKey].gradeId === currentGrade.gradeId;
            });
          });

          // 필터링된 waitingLinkedId에 포함되지 않은 좌석을 필터링
          // 등급이 다른 좌석을 비활성화
          // 좌석형인 경우에만 필터링
          if (!isSection) {
            seats
              .filter(function (seat) {
                return seat.waitingLinkedId !== undefined;
              })
              .filter(function (seat) {
                return linkKeys.indexOf(seat.waitingLinkedId) === -1;
              })
              .map(function (seat) {
                seatSoldOutObject[seat.logicalSeatId] = true;
                return seat;
              });
          }

          // 선택된 등급의 좌석 필터링
          seats = seats.filter(function (seat) {
            return seat.gradeId === currentGrade.gradeId;
          });

          // 구역형인 경우
          if (isSection) {
            // 해당 구역의 좌석 갯수가 필요한 취소표 갯수보다 적은 경우 좌석 비활성화
            var sections = tkPlanState.blockInGradeMap[currentGrade.gradeId];
            sections.map(function (section) {
              var blockSeats = seats.filter(function (seat) {
                return seat.sectionId === section.sectionId;
              });

              // 필요한 취소표 좌석 수 보다 해당 구역의 좌석 수가 적은 경우엔, 해당 구역 좌석 비활성화
              if (blockSeats.length < tk.state.waitingDetail.currentTicketCount) {
                blockSeats.map(function (seat) {
                  seatSoldOutObject[seat.logicalSeatId] = true;
                });
              }
            });
          }
        } else {
          // 예외등급을 설정 안한 구역형인 경우
          if (isSection) {
            // 해당 구역의 좌석 갯수가 필요한 취소표 갯수보다 적은 경우 좌석 비활성화
            var grades = tkPlanState.blockInGradeMap;
            Object.keys(grades).map(function (gradeId) {
              gradeId = parseInt(gradeId, 10);
              var sections = tkPlanState.blockInGradeMap[gradeId];
              sections.map(function (section) {
                var blockSeats = seats.filter(function (seat) {
                  // 해당 section과 grade를 필터링한다
                  // grade까지 필터링 해줘야 서로다른 등급을 신청한 case 예외처리
                  return seat.sectionId === section.sectionId && seat.gradeId === gradeId;
                });

                // 필요한 취소표 좌석 수 보다 해당 구역의 좌석 수가 적은 경우엔, 해당 구역 좌석 비활성화
                if (blockSeats.length < tk.state.waitingDetail.currentTicketCount) {
                  blockSeats.map(function (seat) {
                    seatSoldOutObject[seat.logicalSeatId] = true;
                  });
                }
              });
            });
          }
        }

        tkPlanState.setSeatSoldMap(seatSoldOutObject);
        tkPlanState.filteredSeatSoldMap();
      }

      var returnData = {};

      // 이미 받은 paging 정보도 호출하기 위한 처리
      _.each(keys, function (key) {
        var paging = tkPlanState.pagingMap[key];
        if (!paging) {
          return;
        }
        returnData[key] = paging;
      });

      tk.event.service.signals.updatedReservationSeatDataByAreaWithKey.dispatch(returnData);
      tk.state.develop.debugTimeEnd(
        tk.state.develop.DEBUG_TIME_TYPE.DATA,
        '[Data] Update Reservation Seat Data By Area With Key'
      );

      endWaitingLoading('updateReservationSeatDataByAreaWithKey');
    });
  }

  /**
   * @description 예매 영역 좌석 정보 갱신
   * @param {Array} blockIds 영역 id들
   */
  function updateReservationSeatDataByBlock(blockIds) {
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.DATA,
      '[Data] Update Reservation Seat Data By Block'
    );

    var isWaitingReservation = tk.utils.isWaitingReservation();
    var apis = [];
    var promise;

    // 좌석 정보 호출
    promise = updateAllCanvasByBlock(blockIds);
    if (promise) {
      apis.push(promise.$promise);
    }

    // 판매 좌석 정보 호출
    promise = updateSeatSoldoutByBlock(blockIds);
    if (promise) {
      apis.push(promise.$promise);
    }

    startWaitingLoading('updateReservationSeatDataByBlock');

    // 두 API 호출이 완료된 후 호출
    tk.utils.getPromiseAll(apis).done(function () {
      var returnData = {};

      if (isWaitingReservation) {
        tkPlanState.filteredSeatSoldMap();
      }

      // 이미 받은 paging 정보도 호출하기 위한 처리
      _.each(blockIds, function (blockId) {
        var block = tkPlanState.blockSeatMap[blockId];
        if (!block) {
          return;
        }
        returnData[blockId] = block;
      });
      tk.event.service.signals.updatedReservationSeatDataByBlock.dispatch(returnData);
      tk.state.develop.debugTimeEnd(
        tk.state.develop.DEBUG_TIME_TYPE.DATA,
        '[Data] Update Reservation Seat Data By Block'
      );
      endWaitingLoading('updateReservationSeatDataByBlock');
    });
  }

  /**
   * @description 예매 영역 그리드 좌석 정보 갱신
   * @param {Array} blockId 영역 id
   */
  function updateReservationSeatDataBySector(blockId) {
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.DATA,
      '[Data] Update Reservation Seat Data By Sector'
    );

    var isWaitingReservation = tk.utils.isWaitingReservation();
    var apis = [];
    var promise;

    // 좌석 정보 호출
    promise = updateAllCanvasByBlockArea(blockId);
    if (promise) {
      apis.push(promise.$promise);
    }

    // 판매 좌석 정보 호출
    promise = updateSeatSoldoutByBlock([blockId]);
    if (promise) {
      apis.push(promise.$promise);
    }

    startWaitingLoading('updateReservationSeatDataBySector');

    // 두 API 호출이 완료된 후 호출
    tk.utils.getPromiseAll(apis).done(function () {
      if (isWaitingReservation) {
        tkPlanState.filteredSeatSoldMap();
      }

      var block = tkPlanState.blockSectorMap[blockId];
      if (!block) {
        endWaitingLoading('updateReservationSeatDataBySector');
        return;
      }
      var filteredBlock = {};
      var selectedGrade = tk.state.select.selectedGrade;

      if (!selectedGrade) {
        endWaitingLoading('updateReservationSeatDataBySector');
        return;
      }

      // 선택된 등급 외 좌석이 노출되지 않도록 필터링
      _.each(block, function (grid, blockId) {
        filteredBlock[blockId] = _.filter(grid, function (seat) {
          return seat.gradeId === selectedGrade.gradeId;
        });
      });

      tk.event.service.signals.updatedReservationSeatDataBySector.dispatch(filteredBlock);
      tk.state.develop.debugTimeEnd(
        tk.state.develop.DEBUG_TIME_TYPE.DATA,
        '[Data] Update Reservation Seat Data By Sector'
      );
      endWaitingLoading('updateReservationSeatDataBySector');
    });
  }

  /**
   * @description 그리드 좌석 정보 갱신
   * @param {Object} seatGridIndexes 좌석 그리드 인덱스
   */
  function updateAllCanvasByArea(seatGridIndexes) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Area');
    var getAllBody = [];
    var updatedKeys = [];

    startWaitingLoading('updateAllCanvasByArea');

    var pagingOpts = {
      message: '좌석 페이징 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Area');

        if (error) {
          restoreCallMap(updatedKeys);
          endWaitingLoading('updateAllCanvasByArea');
          return;
        }

        if (!q.data) {
          // 정보가 없을 때
          restoreCallMap(updatedKeys);
          endWaitingLoading('updateAllCanvasByArea');
          return;
        }

        // 이용 가능한 좌석들을 페이징 맵에 넣음
        _.each(q.data.able, function (value, key) {
          tkPlanState.pagingMap[key] = value;
          tkPlanState.pagingLoadCanvasMap[key] = true;
          tkPlanState.setSeats(value);
        });

        // 이용 불가능한 좌석들은 페이징 불 맵에서도 제거
        _.each(q.data.disable, function (value, key) {
          if (tkPlanState.pagingMap.hasOwnProperty(key)) {
            return;
          }
          tkPlanState.pagingBoolMap[key] = false;
          delete tkPlanState.pagingCallMap[key];
          delete tkPlanState.pagingLoadCanvasMap[key];
          delete tkPlanState.pagingLoadSoldoutMap[key];
        });
        tk.event.service.signals.updatedAllCanvasByArea.dispatch(q);
        endWaitingLoading('updateAllCanvasByArea');
      },
      fail: function () {
        restoreCallMap(updatedKeys);
        endWaitingLoading('updateAllCanvasByArea');
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // 조회할 인덱스를 body 로 전환
    for (var x = seatGridIndexes.startX; x <= seatGridIndexes.endX; x++) {
      for (var y = seatGridIndexes.startY; y <= seatGridIndexes.endY; y++) {
        var key = generateSeatGridKey(x, y);

        // 페이징이 안되있는 경우 건너뜀
        if (!tkPlanState.pagingBoolMap[key]) {
          continue;
        }

        // 이미 로드 되었다면
        if (tkPlanState.pagingLoadCanvasMap[key]) {
          continue;
        }
        getAllBody.push({ virtualX: x, virtualY: y });
        updatedKeys.push(updatedKeys);
      }
    }

    // 가져올 페이징 영역이 없는 경우
    if (getAllBody.length === 0) {
      endWaitingLoading('updateAllCanvasByArea');
      return;
    }
    return apiManager.reservePlan.getAllCanvasArea(getAllBody, pagingOpts);
  }

  /**
   * @description 페이징 호출 맵 복구
   * @param {Array} keys 복구할 key 들
   */
  function restoreCallMap(keys) {
    _.each(keys, function (key) {
      tkPlanState.pagingCallMap[key] = false;
    });
  }

  /**
   * @description 그리드 좌석 정보 갱신 (key에 의해서)
   * @param {Array} keys 호출할 key 들
   */
  function updateAllCanvasByAreaWithKeys(keys) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Area With Key');

    if (!Array.isArray(keys) || keys.length === 0) {
      return;
    }

    var isWaitingReservation = tk.utils.isWaitingReservation();
    startWaitingLoading('updateAllCanvasByAreaWithKeys');

    var getAllBody = [];
    var updatedKeys = [];

    var pagingOpts = {
      message: '좌석 페이징 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(
          tk.state.develop.DEBUG_TIME_TYPE.DATA,
          '[Data] Update All Canvas By Area With Key'
        );

        if (error) {
          restoreCallMap(updatedKeys);
          endWaitingLoading('updateAllCanvasByAreaWithKeys');
          return;
        }

        if (!q.data) {
          // 정보가 없을 때
          restoreCallMap(updatedKeys);
          endWaitingLoading('updateAllCanvasByAreaWithKeys');
          return;
        }

        // 이용 가능한 좌석들을 페이징 맵에 넣음
        _.each(q.data.able, function (value, key) {
          tkPlanState.pagingMap[key] = value;
          tkPlanState.pagingLoadCanvasMap[key] = true;
          tkPlanState.setSeats(value);
        });

        // 이용 불가능한 좌석들은 페이징 불 맵에서도 제거
        _.each(q.data.disable, function (value, key) {
          if (tkPlanState.pagingMap.hasOwnProperty(key)) {
            return;
          }
          tkPlanState.pagingBoolMap[key] = false;
          delete tkPlanState.pagingCallMap[key];
          delete tkPlanState.pagingLoadCanvasMap[key];
          delete tkPlanState.pagingLoadSoldoutMap[key];
        });

        tk.event.service.signals.updatedAllCanvasByArea.dispatch(q);
        endWaitingLoading('updateAllCanvasByAreaWithKeys');
      },
      fail: function () {
        restoreCallMap(updatedKeys);

        if (isWaitingReservation) {
          tkWaitingDetailState.endLoading('updateAllCanvasByAreaWithKeys');
        }

        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // keys 로부터 호출할 본문 생성
    _.each(keys, function (key) {
      var parsed = key.split(':');
      var x = parsed[0];
      var y = parsed[1];

      if (!tkPlanState.pagingBoolMap[key]) {
        return;
      }

      // 이미 로드 되었다면
      if (tkPlanState.pagingLoadCanvasMap[key]) {
        return;
      }
      getAllBody.push({ virtualX: x, virtualY: y });
      updatedKeys.push(key);
    });

    // 가져올 페이징 영역이 없는 경우
    if (getAllBody.length === 0) {
      endWaitingLoading('updateAllCanvasByAreaWithKeys');
      return;
    }
    return apiManager.reservePlan.getAllCanvasArea(getAllBody, pagingOpts);
  }

  /**
   * @description 영역 좌석 정보 갱신
   * @param {Array} blockIds 영역 id들
   */
  function updateAllCanvasByBlock(blockIds) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Block');

    if (!Array.isArray(blockIds) || blockIds.length === 0) {
      return;
    }

    startWaitingLoading('updateAllCanvasByBlock');

    var body = [];

    var pagingOpts = {
      message: '영역 좌석 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Block');

        if (error) {
          endWaitingLoading('updateAllCanvasByBlock');
          return;
        }

        if (!q.data || !q.data.hasOwnProperty('able')) {
          // 정보가 없을 때
          endWaitingLoading('updateAllCanvasByBlock');
          return;
        }

        _.each(blockIds, function (blockId) {
          // 조회했을 때 이용 가능한 좌석이 없는 경우
          if (q.data.able.hasOwnProperty(blockId)) {
            return;
          }
          tkPlanState.blockSeatMap[blockId] = [];
          tkPlanState.blockLoadCanvasMap[blockId] = true;
        });

        // 이용 가능한 좌석들을 페이징 맵에 넣음
        _.each(q.data.able, function (value, key) {
          tkPlanState.blockSeatMap[key] = value;
          tkPlanState.blockLoadCanvasMap[key] = true;
          tkPlanState.setSeats(value);
        });
        tk.event.service.signals.updatedAllCanvasByBlock.dispatch(q.data.able);
        endWaitingLoading('updateAllCanvasByBlock');
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    _.each(blockIds, function (blockId) {
      if (tkPlanState.blockLoadCanvasMap[blockId]) {
        return;
      }
      body.push(blockId);
    });

    // 가져올 영역이 없는 경우
    if (body.length === 0) {
      endWaitingLoading('updateAllCanvasByBlock');
      return;
    }

    return apiManager.reservePlan.getAllCanvasBlock(body, pagingOpts);
  }

  /**
   * @description 영역 페이징 좌석 정보 갱신
   * @param {Array} blockId 영역 id
   */
  function updateAllCanvasByBlockArea(blockId) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Block Area');

    var body = blockId;

    var pagingOpts = {
      message: '영역 좌석 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update All Canvas By Block Area');
        endWaitingLoading('updateAllCanvasByBlockArea');

        if (error) {
          return;
        }

        if (!q.data || !q.data.hasOwnProperty('able')) {
          // 정보가 없을 때
          return;
        }

        // 이용 가능한 좌석들을 영역 페이징 맵에 넣음
        _.each(q.data.able, function (value, key) {
          tkPlanState.blockSectorMap[key] = {};
          tkPlanState.blockLoadCanvasMap[key] = true;
          _.each(value, function (v, k) {
            tkPlanState.blockSectorMap[key][k] = v;
            tkPlanState.setSeats(v);
          });
        });
        // tk.event.service.signals.updatedAllCanvasByBlock.dispatch(q.data.able);
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // 가져올 영역이 없는 경우
    if (body === undefined) {
      return;
    }

    startWaitingLoading('updateAllCanvasByBlockArea');

    return apiManager.reservePlan.getAllCanvasBlockArea(body, pagingOpts);
  }

  /**
   * @description 그리드 좌석 판매 정보 갱신
   * @param {Object} seatGridIndexes 좌석 그리드 인덱스
   */
  function updateSeatSoldoutByArea(seatGridIndexes) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Seat Soldout By Area');

    var getAllBody = [];

    var soldOpts = {
      message: '좌석 판매 페이징 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Seat Soldout By Area');

        if (error) {
          endWaitingLoading('getSeatSoldoutArea');
          return;
        }

        if (tk.utils.isWaitingReservation()) {
          tkPlanState.restoreSeatSoldMap();
        }

        if (!q.data) {
          // 정보가 없을 때
          endWaitingLoading('getSeatSoldoutArea');
          return;
        }

        tkPlanState.setSeatSoldMap(q.data);
        tk.event.service.signals.updatedSeatSoldoutByArea.dispatch(q);
        endWaitingLoading('getSeatSoldoutArea');
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // 조회할 인덱스를 body 로 전환
    for (var x = seatGridIndexes.startX; x <= seatGridIndexes.endX; x++) {
      for (var y = seatGridIndexes.startY; y <= seatGridIndexes.endY; y++) {
        var key = generateSeatGridKey(x, y);

        // 페이징이 안되있는 경우 건너뜀
        if (!tkPlanState.pagingBoolMap[key]) {
          continue;
        }
        tkPlanState.pagingLoadSoldoutMap[key] = true;
        getAllBody.push({ virtualX: x, virtualY: y });
      }
    }

    // 가져올 페이징 영역이 없는 경우
    if (getAllBody.length === 0) {
      return;
    }

    startWaitingLoading('getSeatSoldoutArea');
    return apiManager.reservePlan.getSeatSoldoutArea(getAllBody, soldOpts);
  }

  /**
   * @description 그리드 좌석 판매 정보 갱신 (key에 의해서)
   * @param {Array} keys 호출할 key 들
   */
  function updateSeatSoldoutByAreaWithKeys(keys) {
    tk.state.develop.debugTimeStart(
      tk.state.develop.DEBUG_TIME_TYPE.DATA,
      '[Data] Update Seat Soldout By Area With Keys'
    );

    if (!Array.isArray(keys) || keys.length === 0) {
      return;
    }

    var getAllBody = [];

    var soldOpts = {
      message: '좌석 판매 페이징 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(
          tk.state.develop.DEBUG_TIME_TYPE.DATA,
          '[Data] Update Seat Soldout By Area With Keys'
        );

        if (error) {
          endWaitingLoading('updateSeatSoldoutByAreaWithKeys');
          return;
        }

        if (tk.utils.isWaitingReservation()) {
          tkPlanState.restoreSeatSoldMap();
        }

        if (!q.data) {
          // 정보가 없을 때
          endWaitingLoading('updateSeatSoldoutByAreaWithKeys');
          return;
        }

        tkPlanState.setSeatSoldMap(q.data);

        // tk.event.service.signals.updatedSeatSoldoutByArea.dispatch(q);
        endWaitingLoading('updateSeatSoldoutByAreaWithKeys');
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    // keys 로부터 호출할 본문 생성
    _.each(keys, function (key) {
      var parsed = key.split(':');
      var x = parsed[0];
      var y = parsed[1];

      if (!tkPlanState.pagingBoolMap[key]) {
        return;
      }
      tkPlanState.pagingLoadSoldoutMap[key] = true;
      getAllBody.push({ virtualX: x, virtualY: y });
    });

    // 가져올 페이징 영역이 없는 경우
    if (getAllBody.length === 0) {
      return;
    }

    startWaitingLoading('updateSeatSoldoutByAreaWithKeys');
    return apiManager.reservePlan.getSeatSoldoutArea(getAllBody, soldOpts);
  }

  /**
   * @description 영역 좌석 판매 정보 갱신
   * @param {Array} blockIds 영역 id들
   */
  function updateSeatSoldoutByBlock(blockIds) {
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Seat Soldout By Block');

    if (!Array.isArray(blockIds) || blockIds.length === 0) {
      return;
    }

    var body = [];

    var soldOpts = {
      message: '영역 좌석 판매 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Seat Soldout By Block');

        if (error) {
          endWaitingLoading('updateSeatSoldoutByBlock');
          return;
        }

        if (tk.utils.isWaitingReservation()) {
          tkPlanState.restoreSeatSoldMap();
        }

        if (!q.data) {
          // 정보가 없을 때
          endWaitingLoading('updateSeatSoldoutByBlock');
          return;
        }

        tkPlanState.setSeatSoldMap(q.data);
        tk.event.service.signals.updatedSeatSoldoutByBlock.dispatch(q);
        endWaitingLoading('updateSeatSoldoutByBlock');
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    _.each(blockIds, function (blockId) {
      if (!tk.utils.isWaitingReservation()) {
        if (tkPlanState.blockLoadSoldoutMap[blockId]) {
          return;
        }
      }
      tkPlanState.blockLoadSoldoutMap[blockId] = true;
      body.push(blockId);
    });

    // 가져올 영역이 없는 경우
    if (body.length === 0) {
      return;
    }

    startWaitingLoading('updateSeatSoldoutByBlock');

    return apiManager.reservePlan.getSeatSoldoutBlock(body, soldOpts);
  }

  /**
   * @description Grid x, y로 key 를 생성
   * @param {String} x Grid x
   * @param {String} y Grid y
   * @return {String} Grid key
   */
  function generateSeatGridKey(x, y) {
    return [x, y].join(':');
  }

  /**
   * @description 선점 처리
   * @param {Boolean} isAuto 자동배정 여부
   */
  function preOccupancy(isAuto) {
    var result = callPreOccupancy(isAuto);

    // 로딩 처리
    if (!tk.utils.isWaitingReservation()) {
      tkLoading.loadingOn();
    }

    if (!result) {
      tkLoading.loadingOff();
      return;
    }

    if (tk.utils.isWaitingReservation()) {
      return result.$promise.done(waitingPreOccupancySuccess);
    }
    return result.$promise.done((response) => preOccupancySuccess(response, result?.$promise?.requestUrl));
  }

  /**
   * @description 선점 성공 시 callBack
   * @param {Object} q 결과 데이터
   * @param requestUrl 요청 api url
   */
  function preOccupancySuccess(q,requestUrl) {
    tkLoading.loadingOff();

    if(requestUrl?.includes('/occupy/schedules/') && q.result.code === 2001){
      actionWhenHasError();
      alert("시스템에서 비정상적인 활동이 감지되었습니다. 계속될 경우 계정이 차단될 수 있습니다.");
      return;
    }

    if (q.hasOwnProperty('result') && tk.utils.hasErrorCode(q.result)) {
      if (q.result.code === 2000) {
        // 이미 선점하고 있는 경우 처리
        location.href = location.protocol + '//' + location.host + location.pathname;
        return;
      }
      actionWhenHasError();
      tk.utils.errorNotice(q);
      return;
    }

    if (q.hasOwnProperty('errorInfo')) {
      actionWhenHasError();
      tk.utils.errorNotice(q);
      return;
    }

    if (q.data !== undefined) {
      // 다음 단계로 이동
      tk.util.reserve.nextStep(q.data);
    }
  }

  /**
   * @description 예매대기선점 성공 시 callBack
   * @param {Object} q 결과 데이터
   */
  function waitingPreOccupancySuccess(q) {
    if (q.hasOwnProperty('result') && tk.utils.hasErrorCode(q.result)) {
      tkLoading.loadingOff();
      if (q.result.code === 2000) {
        // 이미 선점하고 있는 경우 처리
        alert('이미 선점되었습니다.');
        return;
      }
      actionWhenHasError();
      tk.utils.errorNotice(q);
      return;
    }

    if (q.hasOwnProperty('errorInfo')) {
      tkLoading.loadingOff();
      actionWhenHasError();
      tk.utils.errorNotice(q);
      return;
    }

    if (q.data !== undefined) {
      // 예매대기 신청하기 호출
      tk.event.service.signals.callWaitingReservationRequest.dispatch();
    }
  }

  /**
   * @description 선점 Api 호출
   * @param {Boolean} isAuto 자동배정 여부
   * @return {Object} Promise
   */
  function callPreOccupancy(isAuto) {
    if (tkViewState.isPreOccupancyLocked) {
      // 이미 선점 시도 중일 경우
      return null;
    }
    tkViewState.isPreOccupancyLocked = true;
    tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Preoccupancy');

    var totalCnt = 0;
    var preOccupancySeats = [];
    var preOccupancyZones = [];
    var auto = null;

    // 자동배정에 대한 처리
    if (isAuto) {
      // 자동배정
      auto = {};
      totalCnt = tkSelectState.autoSelectCount;
      auto.productGradeId = tkSelectState.selectedGrade.gradeId;
    } else {
      // 자동배정이 아닌 경우

      // 사석제어
      if (tkPlanState.isSports) {
        // 현재 스포츠의 경우만 사석 처리를 한다.
        var deadSeats = tk.controller.deadSeat.deadSeatController.getDeadSeatsAboutSelectedSeat();
        if (deadSeats.length > 0) {
          alert(deadSeats[0].msg);
          tkViewState.isPreOccupancyLocked = false;
          tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Preoccupancy');

          // 도면 렌더(사석) -------------------------------------
          tk.event.view.signals.updateRenderDeadSeat.dispatch();
          // ----------------------------------------------------
          return null;
        }
      }

      // 선점을 위한 좌석 데이터 설정
      totalCnt = setPreOccupancyDirect(preOccupancySeats, preOccupancyZones);
    }

    // 좌석을 선택하였는지 체크
    if (totalCnt < 1) {
      if (tkSelectState.selectedGrade && tkSelectState.selectedType === tkSelectState.SELECTED_TYPE.AUTO_SELECT) {
        tk.event.ui.signals.popupAutoSelect.dispatch(tkSelectState.selectedGrade);
      } else {
        alert(tk.i18n.translate.getTranslate('PLEASE_SELECT_SEAT'));
      }
      tkViewState.isPreOccupancyLocked = false;
      tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Preoccupancy');
      return null;
    }

    var preOccupancyBody = {
      scheduleId: tkPlanState.schedule.scheduleId,
      memberNo: 0,
      code: 'TKL',
      totalCnt: totalCnt,
      seats: preOccupancySeats,
      zones: preOccupancyZones,
      auto: auto,
      pt: tk.state.view.getStandByTime(),
      nbt: new Date().getTime(),
      ns: performance.timing.navigationStart,
    };

    if (tk.utils.isWaitingReservation()) {
      preOccupancyBody.applicationCnt = tkWaitingDetailState.currentTicketCount;
    }

    var preOccupancyOpts = {
      message: '선점을 실패하였습니다.',
      timer: false,
      done: function (data) {
        const message = data.result.message;
        if (data.result.code === 9999) {
          // TODO: 선점문제
          // alert('')
        }

        if (message) {
          if (message.indexOf('구매가능매수를 초과 선택했습니다') > -1) {
            tkSelectState.isFailureInPurchaseCountLimit = true;
          }
        }

        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Preoccupancy');
      },
      fail: function () {
        tkViewState.isPreOccupancyLocked = false;
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Preoccupancy');
        alert(tk.i18n.translate.getTranslate('alert.already.preoccupancy'));
        tkWaitingDetailState.killAllLoading();
      }
    };
    return apiManager.reservePlan.preOccupancy(preOccupancyBody, preOccupancyOpts);
  }

  /**
   * @description 선점을 위한 좌석 데이터 설정
   * @param {Array} preOccupancySeats 선점할 좌석
   * @param {Array} preOccupancyZones 선점할 비지정석
   * @return {Number} 총 좌석 개수
   */
  function setPreOccupancyDirect(preOccupancySeats, preOccupancyZones) {
    var totalCnt = 0;

    var selectedSeats = tkSelectState.getSelectSeats();
    var selectedZones = tkSelectState.getSelectZones();

    // 선점할 지정석 설정
    for (var idx = 0; idx < selectedSeats.length; idx++) {
      totalCnt += 1;
      preOccupancySeats.push({
        logicalSeatId: selectedSeats[idx].logicalSeatId,
        allotmentCode: selectedSeats[idx].allotmentCode,
        seatAttribute: selectedSeats[idx].mapInfo,
        sortSeatAttribute: selectedSeats[idx].sortMapInfo,
        productGradeId: selectedSeats[idx].gradeId,
        orderNum: selectedSeats[idx].orderNum,
        productGradeName: tkPlanState.gradeMap[selectedSeats[idx].gradeId].name,
        blockId: selectedSeats[idx].blockId,
        area: selectedSeats[idx].area
          ? selectedSeats[idx].area
          : {
              virtualX: Math.floor(selectedSeats[idx].position.x / tkPlanState.seatGridTileSize),
              virtualY: Math.floor(selectedSeats[idx].position.y / tkPlanState.seatGridTileSize)
            },
        st: selectedSeats[idx].st
      });
    }

    // 선점할 비지정석 설정
    for (var idx = 0; idx < selectedZones.length; idx++) {
      totalCnt += selectedZones[idx].count;
      preOccupancyZones.push({
        logicalZoneId: selectedZones[idx].logicalZoneId,
        productGradeId: selectedZones[idx].gradeId,
        productGradeName: tkPlanState.gradeMap[selectedZones[idx].gradeId].name,
        preoccupancyCnt: selectedZones[idx].count
      });
    }

    return totalCnt;
  }

  /**
   * @description [취소표대기] 좌석 묶음 정보
   */
  function updateSeatWaitingLinkedForRefresh() {
    isUpdateSeatWaitingLinked = true;
  }

  function updateSeatWaitingLinked() {
    if (!tk.utils.isWaitingReservation()) {
      return false;
    }

    if (tk.state.global.meta.frontPlanTypeCode !== 'WAITING_APPLICATION') {
      return false;
    }

    if (tk.state.waitingDetail.getReservationType() !== 'SEAT') {
      return false;
    }

    var seatWaitingOpts = {
      message: '예매대기 페이징 연석 정보를 불러오는데 실패하였습니다.',
      timer: false,
      done: function (q, error) {
        tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.DATA, '[Data] Update Seat Soldout By Area');

        if (error) {
          endWaitingLoading('getSeatWaitingLinked');
          return;
        }

        if (!q.data) {
          // 정보가 없을 때
          endWaitingLoading('getSeatWaitingLinked');
          return;
        }

        q.data.map(function (item) {
          var seat = tkPlanState.seatMap[item.logicalSeatId];
          if (!seat) {
            return;
          }
          seat.waitingLinkedId = item.waitingLinkedId;
          tkPlanState.setWaitingLinkedBySeat(seat);
        });
        endWaitingLoading('getSeatWaitingLinked');
      },
      fail: function (kill, message) {
        alert(tk.i18n.translate.getTranslate('plan.seat.api.error'));
        tkWaitingDetailState.killAllLoading();
        tk.event.service.signals.refreshMainView.dispatch();
      }
    };

    var getAllBody = [];
    _.each(TLSVGMatrixInfo.getInstance().getPagingArray(false), function (key) {
      var parsed = key.split(':');
      var x = parsed[0];
      var y = parsed[1];

      getAllBody.push({ virtualX: x, virtualY: y });
    });

    startWaitingLoading('getSeatWaitingLinked');
    return apiManager.reservePlan.getSeatWaitingLinked(getAllBody, seatWaitingOpts);
  }

  /**
   * @description 선점시 에러가 발생했을 때에 대한 처리
   */
  function actionWhenHasError() {
    tkLoading.loadingOff();
    tkViewState.isPreOccupancyLocked = false;

    // 초기화
    tk.event.service.signals.updateReservationSeatData.dispatch();
    tk.event.service.signals.updateReservationData.dispatch();
    tk.event.service.signals.cleanWaitingReservationInfo.dispatch();
  }

  let canUpdate = true;
  scope.checkProcessAndUpdate = function () {
    if (tk.utils.isWaitingReservation()) {
      return true;
    }

    if (tkPlanState.canUpdateRemainInfo) {
      return true;
    }

    let updateFlag = canUpdate;
    const availableRefreshOpts = {
      message: '새로고침을 다시 시도해주세요.',
      timer: false,
      done: function (data) {
        if (data) {
          const serverCanUpdateFlag = data.data;
          if (serverCanUpdateFlag) {
            canUpdate = true;
            updateFlag = true;
          } else {
            canUpdate = false;
          }
        }
      }
    };

    apiManager.reservePlan.availableRefresh(
      {
        scheduleId: tkPlanState.schedule.scheduleId,
        productId: tkPlanState.productId,
        productClassCode: tk.state.global.product.productClassCode
      },
      availableRefreshOpts
    );

    return updateFlag;
  };
  
  /**
   * @description 로딩 디밍 startLoading
   */
  function startWaitingLoading(key) {
    tkWaitingDetailState.startLoading(key);
  }

  /**
   * @description 로딩 디밍 endLoading
   */
  function endWaitingLoading(key) {
    tkWaitingDetailState.endLoading(key);
  }

  return scope;
})();

/**
 * @author donghyun seo
 * @desc UI 관련 컨트롤러
 * @external tk.utils, tk.event.ui, tk.state.plan, tk.state.select, tk.state.view
 */

tk.utils.createNamespace("tk.controller.ui");
tk.controller.ui = (function () {
	'use strict';

	var scope = {};

	var tkPlanState = tk.state.plan;
	var tkSelectState = tk.state.select;
	var tkViewState = tk.state.view;
	var tkDeviceState = tk.state.device;

	tk.event.ui.signals.backToArea.add(backToArea);
	tk.event.ui.signals.zoom.add(zoom);

	/**
	 * @description 구역보기
	 */
	function backToArea () {
		tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.UI, "[UI] Back To Area");

		// 영역이 없으면 구역보기 처리가 필요 없음
		if (!tkPlanState.hasArea) {
			return;
		}

		// 선택된 등급이 없으면 초기화
		if (!tkSelectState.selectedGrade) {
			if (!tkViewState.isAreaView()) {
				tk.event.view.signals.gotoAreaPlan.dispatch('BACK');
				return;
			}
		}

		if (tk.utils.isWaitingReservation()) {
			// [예매대기전용]
			if (tkViewState.isAreaView()) {
				tk.event.view.signals.gotoAreaPlan.dispatch();
				return;
			}

			if (tkViewState.isPartView()) {
				tkSelectState.clearSelectedSeats();
			}

			const blocks = tkPlanState.getBlocksInGradeByGradeId(tkSelectState.selectedGrade.gradeId);
			tkSelectState.setSelectedBlocks(blocks.filter(function (block) {
				return block.remainCnt >= tk.state.waitingDetail.currentTicketCount;
			})); // 등급 내 영역 목록 선택

			tk.event.ui.signals.zoneClear.dispatch();
			tk.event.ui.signals.gradeClear.dispatch();
			if (tkDeviceState.isMobile()) {
				// 모바일 영역 부분 레이어 접음
				tkViewState.isMobileZoneLayerOpen = false;
			}
			tk.event.view.signals.gotoAreaPlan.dispatch();
			return;
		}

		// 영역 화면이 아닌 경우 영역화면으로 이동
		if (tkViewState.isBgView() || tkViewState.isPartView()) {
			// 등급 및 영역 초기화
			tkSelectState.selectedBlock = null;
			var blocks = tkPlanState.getBlocksInGradeByGradeId(tkSelectState.selectedGrade.gradeId);

			tkSelectState.setSelectedBlocks(blocks); // 등급 내 영역 목록 선택
			tk.event.ui.signals.zoneClear.dispatch();

			if (tkViewState.isPartView()) {
				tkSelectState.clearSelectedSeats();
			}

			// 영역으로 이동
			tk.event.view.signals.gotoAreaPlan.dispatch('BACK');
		} else if (tkViewState.isAreaView()) {
			tk.event.ui.signals.gradeClear.dispatch();
			tkSelectState.setSelectedBlocks([]);
			if (tkDeviceState.isMobile()) {
				// 모바일 영역 부분 레이어 접음
				tkViewState.isMobileZoneLayerOpen = false;
			}

			tk.event.view.signals.gotoAreaPlan.dispatch();
		}

		tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.UI, "[UI] Back To Area");

	}

	/**
	 * @description 구역보기
	 * @param {Number} zoomType (In : 1, Out : -1)
	 */
	function zoom (zoomType) {
		if (zoomType === 1) {
			TLSVGMatrixInfo.getInstance().uiZoom(0.5);
			TLEventManager.getInstance().signals.updateRender.dispatch();
		} else if (zoomType === -1) {
			TLSVGMatrixInfo.getInstance().uiZoom(-0.5);
			TLEventManager.getInstance().signals.updateRender.dispatch();
		}
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc view 관련 컨트롤러
 * @external tk.utils, tk.state.plan, tk.state.select, tk.state.view, tk.state.device, tk.i18n.translate, tk.state.waitingDetail
 */

tk.utils.createNamespace("tk.controller.view");
tk.controller.view = (function () {
	'use strict';

	var scope = {};

	var tkPlanState = tk.state.plan;
	var tkSelectState = tk.state.select;
	var tkViewState = tk.state.view;
	var tkDeviceState = tk.state.device;

	scope.init = _init;
	scope.getBlockTooltip = _getBlockTooltip;
	scope.getSeatTooltip = _getSeatTooltip;
	scope.getZoneTooltip = _getZoneTooltip;

	tk.event.view.signals.resizedView.add(resizedView);
	tk.event.view.signals.gotoSeatPlanEvent.add(gotoSeatPlanEvent);
	tk.event.view.signals.gotoAreaPlan.add(gotoAreaPlan);
	tk.event.view.signals.updateRenderDeadSeat.add(updateRenderDeadSeat);
	tk.event.view.signals.viewStandby.add(viewStandby);

	/**
	 * @description 컨트롤러 초기화 (늦게 초기화 되어야할 이벤트 초기화)
	 */
	function _init () {
		TLEventManager.getInstance().signals.c2a_selectBlockEvent.add(selectBlockEvent);
		TLEventManager.getInstance().signals.c2a_selectSeatEvent.add(selectSeatEvent);
		TLEventManager.getInstance().signals.c2a_selectZoneEvent.add(selectZoneEvent);
	}

	/**
	 * @description 등급선택 레이어에 따른 크기 변환 후 처리
	 */
	function resizedView () {
		TLEventManager.getInstance().signals.resizeEvent.dispatch();
	}

	/**
	 * @description 영역 선택 이벤트
	 * @param {Object} block 영역
	 */
	function selectBlockEvent (block) {
		var isSelectTypeDirect = (tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT); // 직접 선택 여부
		// 등급 선택에서 직접 선택 클릭 여부
		var isSelectedTypeSelf = isSelectTypeDirect || (tkSelectState.selectedType === tkSelectState.SELECTED_TYPE.SELF_SELECT);
		var hasSelectedGrade = false;

		if (!block) {
			return;
		}

		// [예매대기전용]
		if (tk.utils.isWaitingReservation()) {
			// 구역형인 경우
			if (tk.state.waitingDetail.reservationType.type === RESERVATION_TYPE.SECTION.type) {
				var selectedBlocks = tk.state.select.getSelectedBlocks().blocks;

				var hasBlock = selectedBlocks.some(function (selectBlock) {
					return selectBlock.blockId === block.blockId;
				});

				if (!hasBlock) {
					alert('필요한 취소표 수 보다 작은 구역은 선택할 수 없습니다.');
					return;
				}

				if (block.grades.length > 1 && !tk.state.waitingDetail.useGradeSelect) {
					// 등급이 2개 이상인 경우엔 등급선택 팝업
					var zone = tkPlanState.blockZoneMap[block.blockId];
					tk.event.ui.signals.popupBlock.dispatch(block, zone);
				} else {
					// 등급이 1개인 경우엔 해당 블록 선택
					var sectionInBlock = tk.state.waitingDetail.getSectionInBlock();
					var currentSection = null;
					for (var i = 0; i < sectionInBlock.length; i++) {
						var section = _.find(sectionInBlock[i].sections, function (currentSection) {
							return currentSection.blockId === block.blockId;
						});
						if (section) {
							currentSection = section;
							break;
						}
					}

					if (!currentSection) {
						return;
					}

					if (currentSection.remainCnt < tk.state.waitingDetail.currentTicketCount) {
						alert('필요한 취소표 수 보다 작은 구역은 선택할 수 없습니다.');
						return;
					}

					tk.event.service.signals.s2u_updatedSectionInBlock.dispatch({
						selectSection: [currentSection],
					});
				}
				// 도면에 진입 안되도록 반환
				return;
			}

			// 선택된 등급과 블록이 다른 경우 진입되지 않도록 처리
			if (tk.state.waitingDetail.useGradeSelect) {
				var currentGrade = tk.state.waitingDetail.currentGrade;
				var hasGrade = block.grades.some(function (grade) {
					return currentGrade.gradeId === grade.gradeId;
				});
				if (!hasGrade) {
					return;
				}
			}

			// 이미 선택된 block (예매가능한블럭)이 아닌 경우엔 진입 안되도록 처리
			var selectedBlocks = tk.state.select.getSelectedBlocks();
			var hasBlock = selectedBlocks.blocks.some(function (selectBlock) {
				return selectBlock.blockId === block.blockId;
			});
			if (!hasBlock) {
				return;
			}
		}

		var zone = null;

		// 미판매 영역 처리
		if (!block.grades) {
			alert(tk.i18n.translate.getTranslate("THIS_IS_NOT_FOR_SALE"));
			return;
		}

		// 미판매 영역 여부 판별
		var hasSomeGradeSale = false;
		var hasSomeGradeRestriction = false;
		_.each(block.grades, function (grade) {
			var gradeInMap = tkPlanState.gradeMap[grade.gradeId];

			if (gradeInMap !== undefined && !gradeInMap.restriction) { // 판매 영역 여부
				hasSomeGradeSale = true;
			}

			if (gradeInMap && gradeInMap.restriction) { // 등급 구매 제약이 있다면
				hasSomeGradeRestriction = true;
			}

			if (tkSelectState.selectedGrade && tkSelectState.selectedGrade.gradeId === grade.gradeId) { // 선택된 등급이 포함되었는지
				hasSelectedGrade = true;
			}
		});

		// 미판매 영역 처리
		if (!hasSomeGradeSale) {
			var message = tkPlanState.isPreSale ? "THERE_IS_NO_SEAT_AVAILABLE_ON_PRESALE_PERIOD" : "THERE_IS_NO_SEAT_AVAILABLE";
			alert(tk.i18n.translate.getTranslate(message));
			return;
		}

		if (!tk.utils.isWaitingReservation()) {
			// 선택된 등급이 없을 경우 등급 갱신
			if (isSelectedTypeSelf && !hasSelectedGrade) {
				tk.event.ui.signals.gradeClear.dispatch();
			}

			// 예매대기인 경우에선 이미 좌석이 선택되어있기에, 갱신되지 않도록 처리
			tkSelectState.selectedGrade = isSelectedTypeSelf && hasSelectedGrade ? tkSelectState.selectedGrade : null;
			tkSelectState.setSelectedBlocks([block]);
		}
		zone = tkPlanState.blockZoneMap[block.blockId];

		if (tkPlanState.isPartExposure()) { // 부분노출
			selectBlockEventForPart(isSelectTypeDirect, isSelectedTypeSelf, hasSelectedGrade, block, zone);
		} else { // 전체노출
			selectBlockEventForWhole(isSelectTypeDirect, isSelectedTypeSelf, hasSelectedGrade, block, zone);
		}

		if (tk.utils.isWaitingReservation()) {
			tk.event.ui.signals.asyncBackButton.dispatch();
		}
	}

	/**
	 * @description 전체노출 영역 선택 이벤트
	 * @param {Object} isSelectTypeDirect 직접선택만 있는지 여부
	 * @param {Object} isSelectedTypeSelf 직접선택 여부
	 * @param {Object} hasSelectedGrade 선택등급 존재 유무
	 * @param {Object} block 영역
	 * @param {Object} zone 비지정석
	 */
	function selectBlockEventForWhole (isSelectTypeDirect, isSelectedTypeSelf, hasSelectedGrade, block, zone) {
		// 직접선택에 비지정석이 있을 경우, 비지정 선택 처리
		if (isSelectTypeDirect && zone) {

			var isSuccess = tkSelectState.selectZone(zone);
			if (!isSuccess) {
				return;
			}

			tk.event.ui.signals.popupZone.dispatch(zone);
			return;
		}

		// 직접선택 + 선택된 등급이 있을 때
		if (isSelectedTypeSelf && hasSelectedGrade) {
			TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
			tkSelectState.selectBlock(block, tkPlanState, tkViewState);
			return;
		}

		// 직접 선택 경우 : 바로 진입
		if (isSelectTypeDirect) {
			TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
			tkSelectState.selectBlock(block, tkPlanState, tkViewState);
			return;
		}

		// [예매대기] 등급선택이 존재하는 경우: 바로진입
		if (tk.utils.isWaitingReservation()) {
			if (tk.state.waitingDetail.useGradeSelect) {
				TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
				tkSelectState.selectBlock(block, tkPlanState, tkViewState);
				return;
			}
		}

		tk.event.ui.signals.popupBlock.dispatch(block, zone);
	}

	/**
	 * @description 부분노출 영역 선택 이벤트
	 * @param {Object} isSelectTypeDirect 직접선택만 있는지 여부
	 * @param {Object} isSelectedTypeSelf 직접선택 여부
	 * @param {Object} hasSelectedGrade 선택등급 존재 유무
	 * @param {Object} block 영역
	 * @param {Object} zone 비지정석
	 */
	function selectBlockEventForPart (isSelectTypeDirect, isSelectedTypeSelf, hasSelectedGrade, block, zone) {

		// 직접선택에 비지정석이 있을 경우, 비지정 선택 처리
		var isSuccess = false;
		if (tk.utils.isWaitingReservation()) {
			if (zone) {
				isSuccess = tkSelectState.selectZone(zone);
				if (!isSuccess) {
					return;
				}
				tk.event.ui.signals.gradeMark.dispatch(zone.gradeId); // 급한 수정으로 문제의 여지가 있을수도 있음
				tk.event.ui.signals.popupZone.dispatch(zone);
				return;
			}
		} else {
			if ((isSelectedTypeSelf || isSelectTypeDirect) && zone) {
				isSuccess = tkSelectState.selectZone(zone);
				if (!isSuccess) {
					return;
				}
				tk.event.ui.signals.gradeMark.dispatch(zone.gradeId); // 급한 수정으로 문제의 여지가 있을수도 있음
				tk.event.ui.signals.popupPartZoneSelect.dispatch(zone);
				return;
			}
		}

		// 직접 선택 경우 : 바로 진입
		if (isSelectTypeDirect && block.grades && block.grades.length === 1) {
			TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
			tkSelectState.selectedGrade = tkPlanState.gradeMap[block.grades[0].gradeId];
			tkSelectState.selectBlock(block, tkPlanState, tkViewState);
			tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.SELF_SELECT);
			tk.event.ui.signals.gradeMark.dispatch(tkSelectState.selectedGrade.gradeId);
			return;
		}

		// 직접선택 + 선택된 등급이 있을 때
		if (isSelectedTypeSelf && hasSelectedGrade) {
			TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
			tkSelectState.selectBlock(block, tkPlanState, tkViewState);
			return;
		}

		// [예매대기] 등급선택이 존재하는 경우: 바로진입
		if (tk.utils.isWaitingReservation()) {
			if (tk.state.waitingDetail.useGradeSelect) {
				TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
				tkSelectState.selectBlock(block, tkPlanState, tkViewState);
				return;
			}
		}

		tk.event.ui.signals.popupBlock.dispatch(block, zone);
	}

	/**
	 * @description 영역으로 이동 이벤트
	 * @param {Object} block 영역
	 */
	function gotoSeatPlanEvent (block) {
		TLEventManager.getInstance().signals.a2c_gotoSeatPlanEvent.dispatch(block);
		tk.event.ui.signals.updateStageDirection.dispatch();
	}

	/**
	 * @description 영역으로 이동
	 */
	function gotoAreaPlan (eventType) {
		tk.state.develop.debugTimeStart(tk.state.develop.DEBUG_TIME_TYPE.UI, "[UI] Goto Area Plan");

		// gotoAreaPlan - updateRender 는 함께 이동해야 한다. ------------------
		if (eventType === "STANDARD") {
		} else if (eventType === "BACK") {
			TLSceneManager.getInstance().gotoAreaPlan("BACK");
		} else if (eventType === "NONE") {
			TLSceneManager.getInstance().gotoAreaPlan("NONE");
		} else {
			TLSceneManager.getInstance().gotoAreaPlan();
		}
		TLEventManager.getInstance().signals.updateRender.dispatch();
		// -------------------------------------------------------------------

		tk.event.ui.signals.updateStageDirection.dispatch();

		tk.state.develop.debugTimeEnd(tk.state.develop.DEBUG_TIME_TYPE.UI, "[UI] Goto Area Plan");
	}

	/**
	 * @description 좌석 선택 이벤트
	 * @param {Object} seat 좌석
	 */
	function selectSeatEvent (seat) {
		if (!validateSelectedGradeAndSelectedType(seat)) {
			return;
		}
		// 판매된 좌석 여부
		if (tkPlanState.seatSoldMap[seat.logicalSeatId]) {
			return;
		}

		var hasWaitingLinkedId = false;

		if (tk.utils.isWaitingReservation()) {
			// 구역형인 경우엔 좌석 선택 안되게
			if (tk.state.waitingDetail.getReservationType() === 'SECTION') {
				return;
			}

			if (seat.hasOwnProperty('waitingLinkedId')) {
				hasWaitingLinkedId = true;
			}
		}

		// 예매대기인 경우
		if (hasWaitingLinkedId) {
			var alreadyReservedSeats = tk.state.waitingDetail.getAlreadyReservedSeats();
			if (alreadyReservedSeats.indexOf(seat.logicalSeatId) !== -1) {
				alert('취소표대기는 본인이 예매한 좌석에 대해 신청이 불가합니다.\n다른 좌석을 선택 해 주세요.');
				return;
			}

			if (seat.waitingLinkedId === null || seat.waitingLinkedId <= 0) {
				var alreadySeats = tk.state.waitingDetail.getAlreadySeats();
				if (alreadySeats.indexOf(seat.logicalSeatId) !== -1) {
					alert('취소표 대기는 동일 좌석에 대해 중복 신청이 불가합니다.\n다른 좌석을 선택해 주세요.');
					return;
				}
				tkSelectState.selectSeat(seat);
			} else {
				// 예매대기 묶음좌석 처리
				var seats = tkPlanState.blockWaitingLinkedMap[seat.waitingLinkedId];

				// 묶음 좌석에 대한 매수 제어 검사
				if (!tkSelectState.isGroupSeatLimitValidate(seats)) {
					return;
				}

				// 이미 신청된 동일좌석 여부 확인
				if (!tkSelectState.isGroupAleradyValidatie(seats)) {
					alert('취소표 대기는 동일 좌석에 대해 중복 신청이 불가합니다.\n다른 좌석을 선택해 주세요.');
					return;
				}

				// 다른 묶음 좌석들도 순서대로 선택
				_.each(seats, function (seatInGroup) {
					tkSelectState.selectSeat(seatInGroup);
				})
			}
		} else {
			// 묶음 좌석의 경우
			if (seat.groupId > 0) {
				var group = tkPlanState.blockGroupMap[seat.blockId][seat.groupId];

				// 묶음 좌석에 대한 매수 제어 검사
				if (!tkSelectState.isGroupSeatLimitValidate(group)) {
					return;
				}

				// 다른 묶음 좌석들도 순서대로 선택
				_.each(group, function (seatInGroup) {
					tkSelectState.selectSeat(seatInGroup);
				})
			} else {
				tkSelectState.selectSeat(seat);
			}
		}
	}

	/**
	 * @description 선택된 등급과 좌석선택 유형에 따른 유효성 처리
	 * @param {Object} seat 좌석
	 * @return {Boolean} 유효성여부
	 */
	function validateSelectedGradeAndSelectedType (seat) {
		if (!seat) {
			return false;
		}

		if (tkPlanState.isPartExposure()) { // 부분노출
			var grade = tkPlanState.gradeMap[seat.gradeId];
			var selectedGrade = tkSelectState.selectedGrade;
			if (!selectedGrade || !grade || grade.gradeId !== selectedGrade.gradeId) {
				// alert(tk.i18n.translate.getTranslate("PLEASE_SELECT_SEAT_OF_SAME_GRADE_AS_SELECTED_GRADE"));
				return false;
			}
		} else { // 전체노출
			if (tkSelectState.selectedType === tkSelectState.SELECTED_TYPE.NONE) {
				tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.SELF_SELECT);
			}
		}
		return true;
	}

	/**
	 * @description 비지정석 선택 이벤트
	 * @param {Object} zone 비지정석
	 */
	function selectZoneEvent (zone) {
		if (!validateSelectedGradeAndSelectedType(zone)) {
			return;
		}

		var isSuccess = tkSelectState.selectZone(zone);
		if (!isSuccess) {
			return;
		}

		tk.event.ui.signals.popupZone.dispatch(zone);
	}

	/**
	 * @description 영역 툴팁 텍스트 리스트
	 * @param {Object} block 영역
	 * @return {Array} 툴팁 텍스트 리스트
	 */
	function _getBlockTooltip (block) {
		var tooltip = [block.blockName];
		var grades = block.grades;

		if (tkDeviceState.isMobile()) {
			return null;
		}

		if (!Array.isArray(grades)) {
			return null;
		}

		grades = tkPlanState.gradeSort(grades, true);
		for (var idx = 0; idx < grades.length; idx++) {
			var grade = grades[idx];
			var gradeInMap = tkPlanState.gradeMap[grade.gradeId];

			if (gradeInMap === undefined || gradeInMap.restriction) {
				continue;
			}

			var remainCnt = null;
			var remainText = '';
			var text = '';

			if (tk.utils.isWaitingReservation()) {
				var waitCnt = tkPlanState.getGradeRemainCntAboutBlockAndGrade(block, grade);
				remainCnt = tk.state.waitingDetail.showAvailableCountExposure() ? waitCnt[0] : null;
				remainText = (remainCnt !== null) ? remainCnt + tk.i18n.translate.getTranslate("SEATS") : '';
				text = "[ " + tkPlanState.gradeMap[grade.gradeId].name + "] " + remainText;
				if (tk.state.waitingDetail.showCountExposure()) {
					// 좌석형에는 대기순번 비노출
					if (tk.state.waitingDetail.reservationType.type === RESERVATION_TYPE.SECTION.type) {
						text += ' - 대기 ' + (waitCnt[1] !== null ? waitCnt[1] : 0) + '건';
					}
				}
			} else {
				remainCnt = tkPlanState.isRemainExposure ? tkPlanState.getGradeRemainCntAboutBlockAndGrade(block, grade) : [null, null];
				remainText = (remainCnt[0] !== null) ? remainCnt[0] + tk.i18n.translate.getTranslate("SEATS") : '';
				text = "[ " + tkPlanState.gradeMap[grade.gradeId].name + "] " + remainText;
			}
			tooltip.push(text);
		}

		if (tooltip.length === 1) {
			tooltip = null;
		}
		return tooltip;
	}

	/**
	 * @description 좌석 툴팁 텍스트 리스트
	 * @param {Object} seat 좌석
	 * @return {Array} 툴팁 텍스트 리스트
	 */
	function _getSeatTooltip (seat) {
		var grade = tkPlanState.gradeMap[seat.gradeId];

		if (tkDeviceState.isMobile()) {
			return null;
		}

		if (!grade) {
			return null;
		}

		if (tkPlanState.seatSoldMap[seat.logicalSeatId]) {
			return null;
		}

		if (tkPlanState.isPartExposure()) { // 부분노출
			var selectedGrade = tkSelectState.selectedGrade;
			if (!selectedGrade || grade.gradeId !== selectedGrade.gradeId) {
				return null;
			}
		}

		var gradeText = "[ " + tkPlanState.gradeMap[seat.gradeId].name + "] ";
		return [gradeText, seat.mapInfo];
	}

	/**
	 * @description 비지정 툴팁 텍스트 리스트
	 * @param {Object} zone 비지정
	 * @return {Array} 툴팁 텍스트 리스트
	 */
	function _getZoneTooltip (zone) {
		var grade = tkPlanState.gradeMap[zone.gradeId];

		if (tkDeviceState.isMobile()) {
			return null;
		}

		if (!grade) {
			return null;
		}


		if (tkPlanState.isPartExposure()) { // 부분노출
			var selectedGrade = tkSelectState.selectedGrade;
			if (!selectedGrade || grade.gradeId !== selectedGrade.gradeId) {
				return null;
			}
		}

		var tooltip = [];
		var gradeText = "[ " + tkPlanState.gradeMap[zone.gradeId].name + "] ";
		tooltip.push(gradeText);

		if (tk.utils.isWaitingReservation()) {
			var remainCnt = tk.state.waitingDetail.showCountExposure() ? tkPlanState.zoneWaitMap[zone.logicalZoneId] : null;
			var waitingText = '';

			if (tk.state.waitingDetail.getReservationType() === 'SECTION') {
				if (remainCnt !== undefined && remainCnt !== null) {
					waitingText += remainCnt;
					waitingText += tk.i18n.translate.getTranslate("SEATS");
				}
			}

			var mapInfo = zone.zoneName + " " + waitingText;
			tooltip.push(mapInfo);
		} else {
			var remainCnt = tkPlanState.isRemainExposure ? tkPlanState.zoneSoldMap[zone.logicalZoneId] : null;
			var remainText = '';
			if (remainCnt !== undefined && remainCnt !== null) {
				remainText += remainCnt;
				remainText += tk.i18n.translate.getTranslate("SEATS");
			}
			var mapInfo = zone.zoneName + " " + remainText;
			tooltip.push(mapInfo);
		}

		return tooltip;
	}

	/**
	 * @description 사석제어 렌더 이벤트
	 */
	function updateRenderDeadSeat () {
	}

	/**
	 * @description View 준비
	 * @param {Object} viewType 뷰 타입
	 */
	function viewStandby (viewType) {
		if (!viewType) {
			return;
		}

		tk.state.view.setViewTypeReady(viewType);
		if (!tk.state.view.isViewTypeReady()) {
			return;
		}

		/**
		 * main view 진입점
		 */
		new mainViewer();
		TLEventManager.getInstance().signals.a2c_planInfoResponseEvent.dispatch();
		tk.event.ui.signals.updateSelectedGrade.dispatch();
	}

	return scope;
})();
/**
 * @author donghyun seo
 * @desc 백그라운드 관련 컨트롤러
 * @external tk.utils, tk.state.develop, tk.state.plan, tk.state.device, tk.state.view
 */

tk.utils.createNamespace("tk.controller.bg");
tk.controller.bg = (function () {
	'use strict';

	var scope = {};

	var previousTime = new Date().getTime();

	var tkDevelopState = tk.state.develop;
	var tkPlanState = tk.state.plan;
	var tkDeviceState = tk.state.device;

	scope.isRunnable = _isRunnable;

	activate();

	/**
	 * @description 활성화
	 */
	function activate () {
		if (tkDevelopState.getPerformanceMode() && !tkDeviceState.isMobile()) {
			setInterval(idlenessAction, 1000);
		}
	}

	/**
	 * @description 백그라운드 실행 가능 여부 반환
	 * @return {Boolean} 백그라운드 실행 가능 여부
	 */
	function _isRunnable () {
		if (!tkPlanState.isReady()) {
			return false;
		}

		// 자동 배정만 있는 상품은 좌석을 볼 일이 없음
		if (tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO) {
			return false;
		}

		// 부분노출 일경우 통과
		if (tkPlanState.isPartExposure()) {
			return false;
		}

		// 다른 작이 돌아가는 중이면 통과
		if (isBusy()) {
			// console.log("isBusy!!");
			refreshTime();
			return false;
		}

		return true;
	}

	/**
	 * @description 다른 작이 돌아가는 중이면 통과 여부 반환
	 * @return {Boolean} 다른 작이 돌아가는 중이면 통과 여부
	 */
	function isBusy () {
		return false;
	}

	/**
	 * @description 다른 작이 돌아가는 중이면 통과 여부 반환
	 * @return {Boolean} 다른 작이 돌아가는 중이면 통과 여부
	 */
	function refreshTime () {
		// console.log("rTime");
		previousTime = new Date().getTime();
	}

	/**
	 * @description 유효시간 여부 반환
	 * @return {Boolean} 유효시간 여부
	 */
	function idlenessTime () {
		var currentTime = new Date().getTime();
		// console.log("iTime", currentTime - previousTime > 2000);
		return currentTime - previousTime > 2000;
	}

	/**
	 * @description 유효시간 작업
	 */
	function idlenessAction () {
		if (_isRunnable() && idlenessTime()) {
			refreshTime();

			var remainPagingKeys = remainPaging();
			//console.log(Object.keys(remainPagingKeys).length);
			//console.log(Object.keys(tkPlanState.pagingMap).length);
			//console.log(Object.keys(tkPlanState.seatMap).length);
			//console.log(Object.keys(tkPlanState.seatSoldMap).length);
			if (Object.keys(remainPagingKeys).length > 0) {
				tk.event.service.signals.updateReservationSeatDataByAreaWithKey.dispatch(remainPagingKeys.slice(0, 5));
			}
		}
	}

	/**
	 * @description 남은 페이징 키 반환
	 * @return {Array} 남은 페이징 키
	 */
	function remainPaging () {
		var remainKey = [];
		for (var key in tkPlanState.pagingLoadCanvasMap) {
			if (!tkPlanState.isNeedToPagingCall(key)) {
				continue;
			}
			remainKey.push(key);
		}
		return remainKey;
	}

	return scope;
})();
/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

function Vector2 (x, y) {

	this.x = x || 0;
	this.y = y || 0;

}

if (Object.assign === undefined) {

	// Missing in IE.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

	(function () {

		Object.assign = function (target) {

			'use strict';

			if (target === undefined || target === null) {

				throw new TypeError('Cannot convert undefined or null to object');

			}

			var output = Object(target);

			for (var index = 1; index < arguments.length; index++) {

				var source = arguments[index];

				if (source !== undefined && source !== null) {

					for (var nextKey in source) {

						if (Object.prototype.hasOwnProperty.call(source, nextKey)) {

							output[nextKey] = source[nextKey];

						}

					}

				}

			}

			return output;

		};

	})();

}

Object.defineProperties(Vector2.prototype, {

	"width": {

		get: function () {

			return this.x;

		},

		set: function (value) {

			this.x = value;

		}

	},

	"height": {

		get: function () {

			return this.y;

		},

		set: function (value) {

			this.y = value;

		}

	}

});

Object.assign(Vector2.prototype, {

	isVector2: true,

	set: function (x, y) {

		this.x = x;
		this.y = y;

		return this;

	},

	setScalar: function (scalar) {

		this.x = scalar;
		this.y = scalar;

		return this;

	},

	setX: function (x) {

		this.x = x;

		return this;

	},

	setY: function (y) {

		this.y = y;

		return this;

	},

	setComponent: function (index, value) {

		switch (index) {

			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			default:
				throw new Error('index is out of range: ' + index);

		}

		return this;

	},

	getComponent: function (index) {

		switch (index) {

			case 0:
				return this.x;
			case 1:
				return this.y;
			default:
				throw new Error('index is out of range: ' + index);

		}

	},

	clone: function () {

		return new this.constructor(this.x, this.y);

	},

	copy: function (v) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	add: function (v, w) {

		if (w !== undefined) {

			console.warn('THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
			return this.addVectors(v, w);

		}

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	addScalar: function (s) {

		this.x += s;
		this.y += s;

		return this;

	},

	addVectors: function (a, b) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	},

	addScaledVector: function (v, s) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;

	},

	sub: function (v, w) {

		if (w !== undefined) {

			console.warn('THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
			return this.subVectors(v, w);

		}

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	subScalar: function (s) {

		this.x -= s;
		this.y -= s;

		return this;

	},

	subVectors: function (a, b) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	},

	multiply: function (v) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	},

	multiplyScalar: function (scalar) {

		if (isFinite(scalar)) {

			this.x *= scalar;
			this.y *= scalar;

		} else {

			this.x = 0;
			this.y = 0;

		}

		return this;

	},

	divide: function (v) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	},

	divideScalar: function (scalar) {

		return this.multiplyScalar(1 / scalar);

	},

	min: function (v) {

		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);

		return this;

	},

	max: function (v) {

		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);

		return this;

	},

	clamp: function (min, max) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));

		return this;

	},

	clampScalar: function () {

		var min = new Vector2();
		var max = new Vector2();

		return function clampScalar (minVal, maxVal) {

			min.set(minVal, minVal);
			max.set(maxVal, maxVal);

			return this.clamp(min, max);

		};

	}(),

	clampLength: function (min, max) {

		var length = this.length();

		return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);

	},

	floor: function () {

		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);

		return this;

	},

	ceil: function () {

		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);

		return this;

	},

	round: function () {

		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = ( this.y < 0 ) ? Math.ceil(this.y) : Math.floor(this.y);

		return this;

	},

	negate: function () {

		this.x = -this.x;
		this.y = -this.y;

		return this;

	},

	dot: function (v) {

		return this.x * v.x + this.y * v.y;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	length: function () {

		return Math.sqrt(this.x * this.x + this.y * this.y);

	},

	lengthManhattan: function () {

		return Math.abs(this.x) + Math.abs(this.y);

	},

	normalize: function () {

		return this.divideScalar(this.length());

	},

	angle: function () {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2(this.y, this.x);

		if (angle < 0) angle += 2 * Math.PI;

		return angle;

	},

	distanceTo: function (v) {

		return Math.sqrt(this.distanceToSquared(v));

	},

	distanceToSquared: function (v) {

		var dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	},

	distanceToManhattan: function (v) {

		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);

	},

	setLength: function (length) {

		return this.multiplyScalar(length / this.length());

	},

	lerp: function (v, alpha) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	},

	lerpVectors: function (v1, v2, alpha) {

		return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);

	},

	equals: function (v) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

	fromArray: function (array, offset) {

		if (offset === undefined) offset = 0;

		this.x = array[offset];
		this.y = array[offset + 1];

		return this;

	},

	toArray: function (array, offset) {

		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;

		array[offset] = this.x;
		array[offset + 1] = this.y;

		return array;

	},

	fromBufferAttribute: function (attribute, index, offset) {

		if (offset !== undefined) {

			console.warn('THREE.Vector2: offset has been removed from .fromBufferAttribute().');

		}

		this.x = attribute.getX(index);
		this.y = attribute.getY(index);

		return this;

	},

	rotateAround: function (center, angle) {

		var c = Math.cos(angle), s = Math.sin(angle);

		var x = this.x - center.x;
		var y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;

	}

});

function Box2 (min, max) {

	this.min = ( min !== undefined ) ? min : new Vector2(+Infinity, +Infinity);
	this.max = ( max !== undefined ) ? max : new Vector2(-Infinity, -Infinity);

}

if (Object.assign === undefined) {

	// Missing in IE.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

	(function () {

		Object.assign = function (target) {

			'use strict';

			if (target === undefined || target === null) {

				throw new TypeError('Cannot convert undefined or null to object');

			}

			var output = Object(target);

			for (var index = 1; index < arguments.length; index++) {

				var source = arguments[index];

				if (source !== undefined && source !== null) {

					for (var nextKey in source) {

						if (Object.prototype.hasOwnProperty.call(source, nextKey)) {

							output[nextKey] = source[nextKey];

						}

					}

				}

			}

			return output;

		};

	})();

}

Object.assign(Box2.prototype, {

	set: function (min, max) {

		this.min.copy(min);
		this.max.copy(max);

		return this;

	},

	setFromPoints: function (points) {

		this.makeEmpty();

		for (var i = 0, il = points.length; i < il; i++) {

			this.expandByPoint(points[i]);

		}

		return this;

	},

	setFromCenterAndSize: function () {

		var v1 = new Vector2();

		return function setFromCenterAndSize (center, size) {

			var halfSize = v1.copy(size).multiplyScalar(0.5);
			this.min.copy(center).sub(halfSize);
			this.max.copy(center).add(halfSize);

			return this;

		};

	}(),

	clone: function () {

		return new this.constructor().copy(this);

	},

	copy: function (box) {

		this.min.copy(box.min);
		this.max.copy(box.max);

		return this;

	},

	makeEmpty: function () {

		this.min.x = this.min.y = +Infinity;
		this.max.x = this.max.y = -Infinity;

		return this;

	},

	isEmpty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	},

	getCenter: function (optionalTarget) {

		var result = optionalTarget || new Vector2();
		return this.isEmpty() ? result.set(0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);

	},

	getSize: function (optionalTarget) {

		var result = optionalTarget || new Vector2();
		return this.isEmpty() ? result.set(0, 0) : result.subVectors(this.max, this.min);

	},

	expandByPoint: function (point) {

		this.min.min(point);
		this.max.max(point);

		return this;

	},

	expandByVector: function (vector) {

		this.min.sub(vector);
		this.max.add(vector);

		return this;

	},

	expandByScalar: function (scalar) {

		this.min.addScalar(-scalar);
		this.max.addScalar(scalar);

		return this;

	},

	containsPoint: function (point) {

		return point.x < this.min.x || point.x > this.max.x ||
		point.y < this.min.y || point.y > this.max.y ? false : true;

	},

	containsBox: function (box) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y;

	},

	getParameter: function (point, optionalTarget) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		var result = optionalTarget || new Vector2();

		return result.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	},

	intersectsBox: function (box) {

		// using 6 splitting planes to rule out intersections.
		return box.max.x < this.min.x || box.min.x > this.max.x ||
		box.max.y < this.min.y || box.min.y > this.max.y ? false : true;

	},

	clampPoint: function (point, optionalTarget) {

		var result = optionalTarget || new Vector2();
		return result.copy(point).clamp(this.min, this.max);

	},

	distanceToPoint: function () {

		var v1 = new Vector2();

		return function distanceToPoint (point) {

			var clampedPoint = v1.copy(point).clamp(this.min, this.max);
			return clampedPoint.sub(point).length();

		};

	}(),

	intersect: function (box) {

		this.min.max(box.min);
		this.max.min(box.max);

		return this;

	},

	union: function (box) {

		this.min.min(box.min);
		this.max.max(box.max);

		return this;

	},

	translate: function (offset) {

		this.min.add(offset);
		this.max.add(offset);

		return this;

	},

	equals: function (box) {

		return box.min.equals(this.min) && box.max.equals(this.max);

	}

});

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLSeatBackgroundLayerBase = function () {
	this.mapSize = 256;
	this.center = 128;
	this.tileSize = 256;
	this.tileRadius = 256;
	this.imageUrl = '';
	this.lowLevelImage = null;
	this.singleImage = null;
	this.tileImage = {};
	this.currentTileImage = {};
	this.tileBGLoadedMap = {};
	for (var row = 0; row < 16; row++) {
		for (var col = 0; col < 16; col++) {
			var key = row.toString() + ':' + col.toString();
			this.tileBGLoadedMap[key] = false;
		}
	}
};

TLSeatBackgroundLayerBase.prototype.setLayerInfo = function (bgInfo) {
	this.mapSize = bgInfo.mapSize;
	this.center = bgInfo.center;
	this.tileSize = bgInfo.imageTileSize;
	this.tileRadius = Math.sqrt((this.tileSize * 0.5) * (this.tileSize * 0.5) * 2);
	// console.log(this.tileRadius)
	this.tileRadius = Math.ceil(this.tileRadius);
	// console.log(this.tileRadius)
	switch (TLG.BACKGROUND_TYPE) {
		case TLG.BG_SINGLE:
		case TLG.BG_EXTENTION_SECTION_TILE:
			this.imageUrl = bgInfo.imageUrl;
			this.loadSingleBG();
			break;
		case TLG.BG_TILE:
		case TLG.BG_SECTION_TILE:
			this.imageUrl = bgInfo.imageTileUrl;
			//this.loadTileBG();
			break;
	}

	// lowLevelImage는 무조건 렌더링 한다.
	this.lowLevelImage = new Image();
	this.lowLevelImage.src = this.imageUrl.replace("{level}_{x}_{y}", "0_0_0");
	this.lowLevelImage.addEventListener('load', this.loadedSingleImage.bind(this), false);
	this.lowLevelImage.addEventListener('error', this.failedToLoadLowLevelImage.bind(this), false);
};

//-------------------------------------------------------
//  Desc : 배경 로딩 관련.
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.loadSingleBG = function () {
	this.singleImage = new Image();
	this.singleImage.src = this.imageUrl;
	this.singleImage.addEventListener('load', this.loadedSingleImage.bind(this), false);
	this.singleImage.addEventListener('error', this.failedToLoadSingleImage.bind(this), false);
};
TLSeatBackgroundLayerBase.prototype.loadTileBG = function () {
	/* setup loadedBackgroundImage */
	for (var row = 0; row < 16; row++) {
		for (var col = 0; col < 16; col++) {
			var sKey = row.toString() + ':' + col.toString();
			this.tileImage[sKey] = new Image();
			var replaceTileNumber = '4' + '_' + row + '_' + col;
			var tileImageUrl = this.imageUrl.replace("{level}_{x}_{y}", replaceTileNumber);
			this.tileImage[sKey].src = tileImageUrl;
			// key 와 위치 주입. -----------------
			this.tileImage[sKey].key = sKey;
			this.tileImage[sKey].tilePosition = {x: row * this.tileSize, y: col * this.tileSize};
			//---------------------------------
			this.tileImage[sKey].addEventListener('load', this.loadedTileImage.bind(this), false);
		}
	}
};
TLSeatBackgroundLayerBase.prototype.pagingLoadTileBG = function () {

};

TLSeatBackgroundLayerBase.prototype.loadedSingleImage = function () {
	TLEventManager.getInstance().signals.updateRender.dispatch();
};
TLSeatBackgroundLayerBase.prototype.loadedTileImage = function (event) {
	//console.log(event.path[0].key)
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

//-------------------------------------------------------
//  Desc : 이미지 로드 실패한 경우 재시도 과정 시작
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.failedToLoadLowLevelImage = function () {
	if (TLG.COUNT_IMAGE_LOAD_LV0 === 0) {
		this.retryImageloadLv0();
	}
	TLEventManager.getInstance().signals.updateRender.dispatch();
};
TLSeatBackgroundLayerBase.prototype.failedToLoadSingleImage = function () {
	if (TLG.COUNT_IMAGE_LOAD_SINGLE === 0) {
		this.retryImageloadSingle();
	}
	TLEventManager.getInstance().signals.updateRender.dispatch();
};
TLSeatBackgroundLayerBase.prototype.failedToLoadTileImage = function (event) {
	TLEventManager.getInstance().signals.updateRender.dispatch();
};


TLSeatBackgroundLayerBase.prototype.setZoneInfo = function (zoneMap) {
	if (!Object.keys(zoneMap).length) {
		return;
	}

};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.updateLayer = function () {
	TLSVGMatrixInfo.getInstance().setChangeLayer("NORMAL", TLG.PLAN_STATE);
	TLSVGMatrixInfo.getInstance().setMapSize("NORMAL", this.mapSize);
};

//-------------------------------------------------------
//  Desc : 0레벨 이미지 존재 여부
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.isLowLevelImageReady = function () {
	var isLowLevelImageReady = this.lowLevelImage.complete && this.lowLevelImage.naturalHeight > 0;
	return isLowLevelImageReady;
};

//-------------------------------------------------------
//  Desc : 기본 전체 등급 이미지 존재 여부
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.isSingleImageReady = function () {
	var isSingleImageReady = this.singleImage.complete && this.singleImage.naturalHeight > 0;
	return isSingleImageReady;
};

//-------------------------------------------------------
//  Desc : 전체 4레벨 이미지 존재 여부
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.isAllTileImageReady = function () {

	for (var key in this.tileImage) {
		var isTileImageReady = this.tileImage[key].complete && this.tileImage[key].naturalHeight > 0;
		if (!isTileImageReady) {
			return false;
		}
	}
	return true;
};

//-------------------------------------------------------
//  Desc : 4레벨 이미지 존재 여부
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.isTileImageReady = function (key) {
	var isTileImageReady = this.tileImage[key].complete && this.tileImage[key].naturalHeight > 0;
	return isTileImageReady;
};

//-------------------------------------------------------
//  Desc : 4레벨 이미지 없을 때 해당 영역 회색 배경
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.drawEmptyTileBG = function (context, tilePositionX, tilePositionY) {
	context.save();
	context.globalAlpha = 1.0;
	context.beginPath();
	context.fillStyle = '#777777';

	var minx = tilePositionX;
	var miny = tilePositionY;
	var maxx = tilePositionX + this.tileSize;
	var maxy = tilePositionY + this.tileSize;

	context.lineTo(minx, maxy);
	context.lineTo(maxx, maxy);
	context.lineTo(maxx, miny);
	context.lineTo(minx, miny);

	context.fill();
	context.clip();
	context.restore();
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.render = function (context) {

	// var p1 = TLSVGMatrixInfo.getInstance().transformedPoint(0, 0);
	// var p2 = TLSVGMatrixInfo.getInstance().transformedPoint(
	// 	TLDomInfo.getInstance().getWidth(),
	// 	TLDomInfo.getInstance().getHeight());
	// TLDomInfo.getInstance().context.globalCompositeOperation = "source-over";
	// TLDomInfo.getInstance().context.clearRect(
	// 	p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

	switch (TLG.BACKGROUND_TYPE) {
		case TLG.BG_SINGLE:
		case TLG.BG_EXTENTION_SECTION_TILE:
			if (this.isSingleImageReady()) {
				context.drawImage(this.singleImage, 0, 0);
			}
			break;
		case TLG.BG_TILE:
		case TLG.BG_SECTION_TILE:
			// level0 이미지로 대체 (모바일 퍼포먼스 확인 필. ------------------
			if (this.isLowLevelImageReady()) {
				context.drawImage(this.lowLevelImage, 0, 0,
					TLSVGMatrixInfo.getInstance().mapSize,
					TLSVGMatrixInfo.getInstance().mapSize);
			}
			//---------------------------------------------------------
			//// 속도저하시 제 1 우선순위로 주석처리후 테스트 해 주세용. ---------------
			//TLDomInfo.getInstance().context.fillStyle = "rgba(255,255,255, 1.0)";
			//TLDomInfo.getInstance().context.fillRect(
			//    0,
			//    0,
			//    TLSVGMatrixInfo.getInstance().mapSize,
			//    TLSVGMatrixInfo.getInstance().mapSize);
			////-----------------------------------------------------------

			for (var key in this.tileImage) {
				var tileImage = this.tileImage[key];
				if (!tileImage) {
					continue;
				}

				if (!this.isTileImageReady(key) && TLG.COUNT_IMAGE_LOAD_LV4[key] === 0) {
					this.retryImageloadLv4(key);
				}

				if (this.isTileImageReady(key)) {
					context.drawImage(tileImage,
						tileImage.tilePosition.x, tileImage.tilePosition.y);
				} else {
					if (!this.isLowLevelImageReady()) {
						this.drawEmptyTileBG(context, tileImage.tilePosition.x, tileImage.tilePosition.y);
					}
				}
			}
			break;
	}


	if (!TLG.isDebug) {
		return;
	}
	var boundaryBox = TLSVGMatrixInfo.getInstance().moveBoundary;
	context.beginPath();
	context.strokeStyle = '#0000FF';
	context.lineWidth = 2;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	context.moveTo(boundaryBox.min.x, boundaryBox.min.y);
	context.lineTo(boundaryBox.min.x, boundaryBox.max.y);
	context.lineTo(boundaryBox.max.x, boundaryBox.max.y);
	context.lineTo(boundaryBox.max.x, boundaryBox.min.y);
	context.lineTo(boundaryBox.min.x, boundaryBox.min.y);

	context.stroke();

	context.strokeStyle = '#00FF00';
	context.beginPath();
	context.arc(boundaryBox.getCenter().x, boundaryBox.getCenter().y,
		TLSVGMatrixInfo.getInstance().moveBoundaryRadius, 0, 2 * Math.PI, false);
	context.stroke();

	var MS2W_Box = TLSVGMatrixInfo.getInstance().moveScreenToWorldBoundary;
	var scale = 1.0;
	context.strokeStyle = '#FF0000';
	context.beginPath();
	context.moveTo(MS2W_Box.LT.x * scale, MS2W_Box.LT.y * scale);
	context.lineTo(MS2W_Box.LB.x * scale, MS2W_Box.LB.y * scale);
	context.lineTo(MS2W_Box.RB.x * scale, MS2W_Box.RB.y * scale);
	context.lineTo(MS2W_Box.RT.x * scale, MS2W_Box.RT.y * scale);
	context.lineTo(MS2W_Box.LT.x * scale, MS2W_Box.LT.y * scale);
	context.stroke();

};

//-------------------------------------------------------
//  Desc  : 좌석 배경 페이징 감지.
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.pagingSectorDetectionBG = function () {
	if (TLG.PLAN_STATE === TLG.PLAN_AREA ||
		TLG.BACKGROUND_TYPE === TLG.BG_SINGLE) {
		return;
	}

	var matrixInfo = TLSVGMatrixInfo.getInstance();

	for (var key in this.tileBGLoadedMap) {
		if (this.tileBGLoadedMap[key]) {
			continue;
		}
		var rowColArray = key.split(':', 2);
		var row = parseInt(rowColArray[0]);
		var col = parseInt(rowColArray[1]);
		var x = row * this.tileSize + this.tileSize * 0.5;
		var y = col * this.tileSize + this.tileSize * 0.5;
		var sumRadiusSquared = (matrixInfo.worldScreenRadius + this.tileRadius);
		sumRadiusSquared *= sumRadiusSquared;
		var squaredLength = matrixInfo.worldCenterPosition.distanceToSquared({x: x, y: y});
		if (squaredLength < sumRadiusSquared) {
			this.tileBGLoadedMap[key] = true;

			this.tileImage[key] = new Image();
			var replaceTileNumber = '4' + '_' + row + '_' + col;
			var tileImageUrl = this.imageUrl.replace("{level}_{x}_{y}", replaceTileNumber);
			this.tileImage[key].src = tileImageUrl;
			// key 와 위치 주입. -----------------
			this.tileImage[key].key = key;
			this.tileImage[key].tilePosition = {x: row * this.tileSize, y: col * this.tileSize};
			//---------------------------------
			this.tileImage[key].addEventListener('load', this.loadedTileImage.bind(this), false);
			this.currentTileImage[key] = this.tileImage[key];
		}
	}

};

//-------------------------------------------------------
//  Desc : 첫번째 로드 실패 후 500ms 간격으로 2번 더 시도
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.retryImageloadSingle = function () {
	if (TLG.COUNT_IMAGE_LOAD_SINGLE > 2) {
		return;
	}
	var singleImage = this.singleImage;
	var selfBase = this;
	var tryReloadImageSingle = function () {
		TLG.COUNT_IMAGE_LOAD_SINGLE++;
		if (TLG.COUNT_IMAGE_LOAD_SINGLE > 2) {
			clearInterval(looperSingle);
			return;
		}
		selfBase.reloadImage(singleImage);
		if (selfBase.isSingleImageReady()) {
			clearInterval(looperSingle);
		}
	};

	var looperSingle = setInterval(tryReloadImageSingle, 500);
};

TLSeatBackgroundLayerBase.prototype.retryImageloadLv0 = function () {
	if (TLG.COUNT_IMAGE_LOAD_LV0 > 2) {
		return;
	}
	var lv0Image = this.lowLevelImage;
	var selfBase = this;
	var tryReloadImageLv0 = function () {
		TLG.COUNT_IMAGE_LOAD_LV0++;
		if (TLG.COUNT_IMAGE_LOAD_LV0 > 2) {
			clearInterval(looperLv0);
			return;
		}
		selfBase.reloadImage(lv0Image);
		if (selfBase.isLowLevelImageReady()) {
			clearInterval(looperLv0);
		}
	};

	var looperLv0 = setInterval(tryReloadImageLv0, 500);
};

TLSeatBackgroundLayerBase.prototype.retryImageloadLv4 = function (key) {
	if (TLG.COUNT_IMAGE_LOAD_LV4[key] > 2) {
		return;
	}
	var tileImage = this.currentTileImage[key];
	var selfBase = this;
	var tryReloadImageTile = function () {
		TLG.COUNT_IMAGE_LOAD_LV4[key]++;
		if (TLG.COUNT_IMAGE_LOAD_LV4[key] > 2) {
			clearInterval(looperLv4);
			return;
		}

		selfBase.reloadImage(tileImage);
		if (selfBase.isTileImageReady(key)) {
			clearInterval(looperLv4);
		}
	};

	var looperLv4 = setInterval(tryReloadImageTile, 500);

};

//-------------------------------------------------------
//  Desc : 이미지 로드 재시도
//-------------------------------------------------------
TLSeatBackgroundLayerBase.prototype.reloadImage = function (failedImage) {
	if ('undefined' !== typeof failedImage) {
		var srcReal = failedImage.src;
		failedImage.src = srcReal + '?';
		failedImage.src = failedImage.src.split('?')[0];
	}
};

var TLSeatBackgroundLayer = Singletonify(TLSeatBackgroundLayerBase);

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLMiniMapLayerBase = function () {
	this.miniMapDom = document.getElementById("minimap_view");
	this.miniMapCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	this.miniMapDom.appendChild(this.miniMapCanvas);
	this.miniMapContext = this.miniMapCanvas.getContext('2d');
	this.miniMapCanvas.style.position = 'absolute';
	this.miniMapCanvas.width = this.miniMapDom.clientHeight;
	this.miniMapCanvas.height = this.miniMapDom.clientHeight;
	//this.miniMapCanvas.style.zIndex = 0;
	//this.miniMapCanvas.style.display = 'none';
	this.mapSize = Math.min(this.miniMapDom.clientWidth, this.miniMapDom.clientHeight);
	this.imageUrl = '';
	this.mapScale = 1.0;
	this.areaMapScale = 1.0;
	this.image = new Image();
	//    this.dashOffset = 0.0;

	//TLEventManager.getInstance().signals.updateRender.add(this.render.bind(this));
};

TLMiniMapLayerBase.prototype.setLayerInfo = function (bgInfo) {
	this.imageUrl = bgInfo.imageUrlThumnail.substring(0,
		bgInfo.imageUrlThumnail.lastIndexOf('?') + 1);
	this.imageUrl += this.mapSize.toString() + 'x' + this.mapSize.toString();
	this.mapScale = this.mapSize / bgInfo.mapSize;
	this.areaMapScale = this.mapSize / TLAreaBackgroundLayer.getInstance().mapSize;
	this.image.src = this.imageUrl;
	this.image.addEventListener('error', this.failedToLoadImage.bind(this), false);
	this.image.addEventListener('load', this.loadedImage.bind(this), false);
};

TLMiniMapLayerBase.prototype.loadedImage = function () {
	//TLEventManager.getInstance().signals.updateRender.dispatch();
	//this.miniMapRenderLoop();
	this.render();
};

//-------------------------------------------------------
//  Desc : 이미지 로드 실패한 경우 재시도 과정 시작
//-------------------------------------------------------
TLMiniMapLayerBase.prototype.failedToLoadImage = function () {
	//TLEventManager.getInstance().signals.updateRender.dispatch();
	//this.miniMapRenderLoop();
	if (TLG.COUNT_IMAGE_LOAD_MINI === 0) {
		this.retryImageloadMini();
	}
	this.render();
};

TLMiniMapLayerBase.prototype.isImageReady = function () {
	return (this.image.complete && this.image.naturalHeight > 0);
};

TLMiniMapLayerBase.prototype.render = function () {
	this.miniMapContext.clearRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
	if (this.isImageReady()) {
		this.miniMapContext.drawImage(this.image, 0, 0);
	}
	//this.miniMapContext.fillStyle = "rgba(0,255,0,1)";
	//this.miniMapContext.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
	this.drawScreenBox(this.miniMapContext);

	this.miniMapContext.lineWidth = 2;
	this.miniMapContext.strokeRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
};

TLMiniMapLayerBase.prototype.drawScreenBox = function (context) {
	var scale = TLG.PLAN_STATE === TLG.PLAN_AREA ? this.areaMapScale : this.mapScale;
	var S2W_Box = TLSVGMatrixInfo.getInstance().screenToWorldBox;

	context.save();
	context.globalAlpha = 1.0;

	context.beginPath();
	context.strokeStyle = '#FF0000';
	context.lineWidth = 2;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	if (CanvasRenderingContext2D.prototype.setLineDash) {
		context.setLineDash([3, 3]);
	}
	//context.lineDashOffset = -this.dashOffset;
	context.lineDashOffset -= 0.4;

	context.moveTo(S2W_Box.LT.x * scale, S2W_Box.LT.y * scale);
	context.lineTo(S2W_Box.LB.x * scale, S2W_Box.LB.y * scale);
	context.lineTo(S2W_Box.RB.x * scale, S2W_Box.RB.y * scale);
	context.lineTo(S2W_Box.RT.x * scale, S2W_Box.RT.y * scale);
	context.lineTo(S2W_Box.LT.x * scale, S2W_Box.LT.y * scale);

	context.stroke();

	context.clip();
	if (this.isImageReady()) {
		context.drawImage(this.image, 0, 0);
	}
	context.restore();
	context.globalAlpha = 0.3;
};

//TLMiniMapLayerBase.prototype.miniMapRenderLoop = function () {
//    this.dashOffset += 1.0;
//    if (this.dashOffset > 16) {
//        this.dashOffset = 0;
//    }
//    this.render();
//    setTimeout(this.miniMapRenderLoop.bind(this), 50);
//};

//-------------------------------------------------------
//  Desc : 첫번째 로드 실패 후 500ms 간격으로 2번 더 시도
//-------------------------------------------------------
TLMiniMapLayerBase.prototype.retryImageloadMini = function () {
	if (TLG.COUNT_IMAGE_LOAD_MINI > 2) {
		return;
	}
	var image = this.image;
	var selfBase = this;
	var tryReloadImageMini = function () {
		TLG.COUNT_IMAGE_LOAD_MINI++;
		if (TLG.COUNT_IMAGE_LOAD_MINI > 2) {
			clearInterval(looperMini);
			return;
		}

		selfBase.reloadImage(image);
		if (selfBase.isImageReady()) {
			clearInterval(looperMini);
			return;
		}
	};

	var looperMini = setInterval(tryReloadImageMini, 500);

};

//-------------------------------------------------------
//  Desc : 이미지 로드 재시도
//-------------------------------------------------------
TLMiniMapLayerBase.prototype.reloadImage = function (failedImage) {
	if ('undefined' !== typeof failedImage) {
		var srcReal = failedImage.src;
		failedImage.src = srcReal + '?';
		failedImage.src = failedImage.src.split('?')[0] + '?' + failedImage.src.split('?')[1];
	}
};


var TLMiniMapLayer = Singletonify(TLMiniMapLayerBase);




//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLLogicalSeatLayerBase = function () {
	this.offScreenCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	//this.offScreenCanvas.style.position = 'absolute';
	//TLDomInfo.getInstance().getDomElement().appendChild(this.offScreenCanvas);
	this.offScreenCanvas.width = TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_INTERSECT_SPACE * 2;
	this.offScreenCanvas.height = TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_INTERSECT_SPACE * 2;
	this.offScreenContext = this.offScreenCanvas.getContext('2d');

	this.tileImage = {};
	tk.event.service.signals.updatedReservationSeatDataByBlock.add(this.loadLogicalSeatBlockEvent.bind(this));
	tk.event.service.signals.updatedReservationSeatDataByAreaWithKey.add(this.loadPagingLogicalSeatEvent.bind(this));
	tk.event.service.signals.updatedReservationSeatDataBySector.add(this.loadSectorLogicalSeatEvent.bind(this));

	tk.event.service.signals.s2u_updatedSelectedSeat.add(this.updatedSelectedSeatEvent.bind(this)); //선택된 지정석/비지정석 정보 갱신.
	tk.event.view.signals.updateRenderDeadSeat.add(this.updateDeadSeatEvent.bind(this)); // 사석시 발생 이벤트.
	// 사석 이벤트
	this.defaultGradeColor = "rgba(255,255,0,1.0)";

	this.deadSeatIntervalID = null;
	this.deadSeatIntervalCount = 0;
};

TLLogicalSeatLayerBase.prototype.pagingSeatInfo = function (ableMap) {
	for (var key in ableMap) {
		this.makeSeatImageTile(ableMap[key], key);
	}
};

//-------------------------------------------------------
//  Desc : 블록 섹션 및 좌석 paging 이벤트.
//-------------------------------------------------------
TLLogicalSeatLayerBase.prototype.loadLogicalSeatBlockEvent = function (seatBlockMap) {
	//console.log(seatBlockMap)

	//console.log(tk.state.plan.gradeMap)
	//tk.state.plan.gradeMap
	//tk.state.plan.pagingMap["1:1"];
	//tk.state.plan.blockSeatMap["블럭아이디"]

	//tk.state.plan.seatMap[logicalID]
	//tk.state.plan.seatSoldMap[logicalID]


	//tk.state.select.selectedSeatMap = {}; // 선택된 좌석
	//tk.state.select.selectedZoneMap = {}; // 선택된 비지정석


};

TLLogicalSeatLayerBase.prototype.loadPagingLogicalSeatEvent = function (gridObject) {
	//console.log("페이징")
	//console.log(gridObject)
	//
	//console.log(tk.state.plan.gradeMap)
	//tk.state.plan.gradeMap
	//tk.state.plan.pagingMap["1:1"];
	//tk.state.plan.blockSeatMap["블럭아이디"]

	//tk.state.plan.seatMap[logicalID]
	//tk.state.plan.seatSoldMap[logicalID]

	for (var key in gridObject) {
		this.makeSeatImageTile(gridObject[key], key);
	}
};
TLLogicalSeatLayerBase.prototype.loadSectorLogicalSeatEvent = function (gridObject) {
	for (var key in gridObject) {
		this.makeSeatImageTile(gridObject[key], key);
	}
};

TLLogicalSeatLayerBase.prototype.updatedSelectedSeatEvent = function () {
	//console.log("지정석/비지정석 선택됨.")
	//console.log(tk.state.select.selectedSeatMap)
	//console.log(tk.state.select.selectedZoneMap)
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

TLLogicalSeatLayerBase.prototype.updateDeadSeatEvent = function () {
	var boundaryBox = new Box2();
	var count = 0;
	for (var key in tk.state.select.deadSeatMap) {
		var deadSeatInfo = tk.state.select.deadSeatMap[key];
		if (count === 0) {
			boundaryBox.min.x = deadSeatInfo.position.x;
			boundaryBox.min.y = deadSeatInfo.position.y;
			boundaryBox.max.x = deadSeatInfo.position.x;
			boundaryBox.max.y = deadSeatInfo.position.y;
		}
		boundaryBox.min.x = Math.min(deadSeatInfo.position.x, boundaryBox.min.x);
		boundaryBox.min.y = Math.min(deadSeatInfo.position.y, boundaryBox.min.y);
		boundaryBox.max.x = Math.max(deadSeatInfo.position.x, boundaryBox.max.x);
		boundaryBox.max.y = Math.max(deadSeatInfo.position.y, boundaryBox.max.y);
	}

	for (var key in tk.state.select.selectedSeatMap) {
		var selectedSeatInfo = tk.state.select.selectedSeatMap[key];
		boundaryBox.min.x = Math.min(selectedSeatInfo.position.x, boundaryBox.min.x);
		boundaryBox.min.y = Math.min(selectedSeatInfo.position.y, boundaryBox.min.y);
		boundaryBox.max.x = Math.max(selectedSeatInfo.position.x, boundaryBox.max.x);
		boundaryBox.max.y = Math.max(selectedSeatInfo.position.y, boundaryBox.max.y);
	}
	var center = boundaryBox.getCenter();
	TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", center.x, center.y);

	//console.log(tk.state.select.deadSeatMap)
	//console.log(tk.state.select.selectedSeatMap)
	this.deadSeatIntervalCount = 0;
	this.deadSeatIntervalID = setInterval(this.deadSeatInterval.bind(this), 400);
	// 선택된 맵과 사석맵의 바운더리 체크후 중심점이동.
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

TLLogicalSeatLayerBase.prototype.clearImageTile = function () {
	for (var key in this.tileImage) {
		this.tileImage[key] = null;
		//delete this.tileImage;
	}
	this.tileImage = {};

};

//-------------------------------------------------------
//  Desc : 도면이 회전된 후에 호출한다.
//-------------------------------------------------------
TLLogicalSeatLayerBase.prototype.renderTrimSeatImageTile = function (seatArray, key) {
	//var rowColArray = key.split(':', 2);
	//var x = parseInt(rowColArray[0]) * TLG.LOGICAL_TILE_SIZE - TLG.LOGICAL_TILE_INTERSECT_SPACE;
	//var y = parseInt(rowColArray[1]) * TLG.LOGICAL_TILE_SIZE - TLG.LOGICAL_TILE_INTERSECT_SPACE;
	////this.offScreenContext.clearRect(0, 0, this.offScreenCanvas.width, this.offScreenCanvas.height);
	//this.offScreenContext.strokeStyle = '#FFFFFF';
	//this.offScreenContext.beginPath();
	//for (var idx = seatArray.length - 1; idx >= 0; idx--) {
	//    var seatInfo = seatArray[idx];
	//    //console.log(seatInfo)
	//    if( tk.state.plan.seatSoldMap[seatInfo.logicalSeatId] ) {
	//        continue;
	//    }
	//    this.offScreenContext.moveTo(seatInfo.cornerPoints.ne.x - x, seatInfo.cornerPoints.ne.y - y);
	//    this.offScreenContext.lineTo(seatInfo.cornerPoints.se.x - x, seatInfo.cornerPoints.se.y - y);
	//    this.offScreenContext.lineTo(seatInfo.cornerPoints.nw.x - x, seatInfo.cornerPoints.nw.y - y);
	//    this.offScreenContext.lineTo(seatInfo.cornerPoints.sw.x - x, seatInfo.cornerPoints.sw.y - y);
	//    this.offScreenContext.lineTo(seatInfo.cornerPoints.ne.x - x, seatInfo.cornerPoints.ne.y - y);
	//}
	//
	//this.offScreenContext.stroke();
};
//-------------------------------------------------------
//  Desc : create logical tile image
//-------------------------------------------------------
TLLogicalSeatLayerBase.prototype.makeSeatImageTile = function (seatArray, key) {
	var rowColArray = key.split(':', 2);
	var x = parseInt(rowColArray[0]) * TLG.LOGICAL_TILE_SIZE - TLG.LOGICAL_TILE_INTERSECT_SPACE;
	var y = parseInt(rowColArray[1]) * TLG.LOGICAL_TILE_SIZE - TLG.LOGICAL_TILE_INTERSECT_SPACE;
	this.offScreenContext.clearRect(0, 0, this.offScreenCanvas.width, this.offScreenCanvas.height);
	for (var idx = seatArray.length - 1; idx >= 0; idx--) {
		var seatInfo = seatArray[idx];
		var gradeInfo = tk.state.plan.gradeMap[seatInfo.gradeId];


		if (tk.utils.isWaitingReservation()) {
			if (tk.state.waitingDetail.hasOwnProperty('useGradeSelect')) {
				// [예매대기전용] 등급 선택이 존재하는 경우, 선택된 등급만 출력
				if (tk.state.waitingDetail.useGradeSelect) {
					var curGrade = tk.state.waitingDetail.currentGrade;
					if (curGrade.gradeId !== seatInfo.gradeId) {
						continue;
					}
				}
			}
		}

		if (tk.state.plan.seatSoldMap[seatInfo.logicalSeatId]) {
			continue;
		}

		if (!gradeInfo) {
			continue;
		}

		this.offScreenContext.beginPath();

		this.offScreenContext.moveTo(seatInfo.cornerPoints.ne.x - x, seatInfo.cornerPoints.ne.y - y);
		this.offScreenContext.lineTo(seatInfo.cornerPoints.se.x - x, seatInfo.cornerPoints.se.y - y);
		this.offScreenContext.lineTo(seatInfo.cornerPoints.nw.x - x, seatInfo.cornerPoints.nw.y - y);
		this.offScreenContext.lineTo(seatInfo.cornerPoints.sw.x - x, seatInfo.cornerPoints.sw.y - y);
		this.offScreenContext.lineTo(seatInfo.cornerPoints.ne.x - x, seatInfo.cornerPoints.ne.y - y);

		//this.offScreenContext.strokeStyle = '#ff0000';
		//this.offScreenContext.stroke();
		if (gradeInfo) {
			if (gradeInfo.seatColor) {
				this.offScreenContext.fillStyle = gradeInfo.seatColor;
			} else {
				this.offScreenContext.fillStyle = gradeInfo.color;
			}
		} else {
			this.offScreenContext.fillStyle = gradeInfo	= this.defaultGradeColor;
		}
		this.offScreenContext.fill();
	}

	//this.offScreenContext.strokeStyle = "rgba(0,255,255,1.0)";
	//this.offScreenContext.strokeWidth = 5;
	//this.offScreenContext.stroke();
	//this.offScreenContext.strokeRect(5,5,
	//  TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_INTERSECT_SPACE ,
	//  TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_INTERSECT_SPACE );


	this.tileImage[key] = new Image();
	this.tileImage[key].src = this.offScreenCanvas.toDataURL();
	// key 와 위치 주입. -----------------
	this.tileImage[key].key = key;
	this.tileImage[key].tilePosition = {x: x, y: y};
	//---------------------------------
	this.tileImage[key].addEventListener('load', this.loadedLogicalTileImage.bind(this), false);
};
TLLogicalSeatLayerBase.prototype.loadedLogicalTileImage = function (event) {
	//console.log(event.path[0].key)
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

//-------------------------------------------------------
//  Desc : render seat Tile Image
//-------------------------------------------------------
TLLogicalSeatLayerBase.prototype.render = function () {
	for (var key in this.tileImage) {
		var tileImage = this.tileImage[key];
		if (!tileImage) {
			continue;
		}
		TLDomInfo.getInstance().context.drawImage(tileImage,
			tileImage.tilePosition.x, tileImage.tilePosition.y);
	}

	this.drawSelectedSeat(TLDomInfo.getInstance().context);
	this.drawDeadSeat(TLDomInfo.getInstance().context);
	this.drawZone(TLDomInfo.getInstance().context);
};

////---------------------------------------------------------------------
////	Desc : *중요* 아래 루프문 안에 beginPath() 가 있는 이유는 일부기종 특히 최근에
////			     나온 삼성 일부폰의 웹뷰에서 path의 기능을 제대로 지원하지 않기 때문.
////---------------------------------------------------------------------
//TLLogicalSeatLayerBase.prototype.drawSelectedSeat = function (context) {
//	//tk.state.select.selectedSeatMap = {}; // 선택된 좌석
//	//tk.state.select.selectedZoneMap = {}; // 선택된 비지정석
//
//	context.strokeStyle = '#000000';
//	context.lineWidth = 2;
//	context.lineCap = 'round';
//	context.lineJoin = 'round';
//	for (var key in tk.state.select.selectedSeatMap) {
//		var seatInfo = tk.state.select.selectedSeatMap[key];
//		context.beginPath();
//		context.moveTo(seatInfo.cornerPoints.ne.x, seatInfo.cornerPoints.ne.y);
//		context.lineTo(seatInfo.cornerPoints.se.x, seatInfo.cornerPoints.se.y);
//		context.lineTo(seatInfo.cornerPoints.nw.x, seatInfo.cornerPoints.nw.y);
//		context.lineTo(seatInfo.cornerPoints.sw.x, seatInfo.cornerPoints.sw.y);
//		context.lineTo(seatInfo.cornerPoints.ne.x, seatInfo.cornerPoints.ne.y);
//		context.stroke();
//	}
//
//	context.strokeStyle = '#FFFFFF';
//	context.lineWidth = 0.5;
//	context.lineCap = 'round';
//	context.lineJoin = 'round';
//	for (var key in tk.state.select.selectedSeatMap) {
//		var seatInfo = tk.state.select.selectedSeatMap[key];
//		context.beginPath();
//		context.moveTo(seatInfo.cornerPoints.ne.x, seatInfo.cornerPoints.ne.y);
//		context.lineTo(seatInfo.cornerPoints.se.x, seatInfo.cornerPoints.se.y);
//		context.lineTo(seatInfo.cornerPoints.nw.x, seatInfo.cornerPoints.nw.y);
//		context.lineTo(seatInfo.cornerPoints.sw.x, seatInfo.cornerPoints.sw.y);
//		context.lineTo(seatInfo.cornerPoints.ne.x, seatInfo.cornerPoints.ne.y);
//		context.stroke();
//	}
//};
//---------------------------------------------------------------------
//	Desc :
//---------------------------------------------------------------------
TLLogicalSeatLayerBase.prototype.drawSelectedSeat = function (context) {
	//tk.state.select.selectedSeatMap = {}; // 선택된 좌석
	//tk.state.select.selectedZoneMap = {}; // 선택된 비지정석

	context.fillStyle = '#000000';
	for (var key in tk.state.select.selectedSeatMap) {
		var seatInfo = tk.state.select.selectedSeatMap[key];
		context.beginPath();
		context.arc(seatInfo.position.x, seatInfo.position.y, 7, 0, 2 * Math.PI, false);
		context.fill();
	}


	for (var key in tk.state.select.selectedSeatMap) {
		var seatInfo = tk.state.select.selectedSeatMap[key];
		var gradeInfo = tk.state.plan.gradeMap[seatInfo.gradeId];
		context.beginPath();
		context.fillStyle = gradeInfo ? gradeInfo.color : this.defaultGradeColor;
		context.arc(seatInfo.position.x, seatInfo.position.y, 4, 0, 2 * Math.PI, false);
		context.fill();
	}
};

TLLogicalSeatLayerBase.prototype.drawDeadSeat = function (context) {
	if (this.deadSeatIntervalID && this.deadSeatIntervalCount % 2) {
		return;
	}
	if (!Object.keys(tk.state.select.deadSeatMap).length) {
		return;
	}

	var radius = 4;
	for (var key in tk.state.select.deadSeatMap) {
		var seatInfo = tk.state.select.deadSeatMap[key];
		context.beginPath();
		context.fillStyle = '#000000';
		context.arc(seatInfo.position.x, seatInfo.position.y, radius, 0, 2 * Math.PI, false);
		context.fill();
		context.beginPath();
		context.fillStyle = '#FFFFFF';
		context.arc(seatInfo.position.x, seatInfo.position.y, radius - 2, 0, 2 * Math.PI, false);
		context.fill();
	}
};
TLLogicalSeatLayerBase.prototype.deadSeatInterval = function () {
	this.deadSeatIntervalCount++;
	if (this.deadSeatIntervalCount > 7) {
		this.deadSeatIntervalCount = 0;
		clearInterval(this.deadSeatIntervalID);
		this.deadSeatIntervalID = null;
	}
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

TLLogicalSeatLayerBase.prototype.drawZone = function (context) {
	if (!Object.keys(tk.state.plan.zoneSoldMap).length) {
		return;
	}

	context.lineWidth = 5;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	for (var key in tk.state.plan.zoneMap) {
		if (tk.state.select.selectedZoneMap[key]) {
			continue;
		}
		if (tk.state.plan.zoneSoldMap[key] <= 0) {
			continue;
		}

		var zoneInfo = tk.state.plan.zoneMap[key];
		var gradeInfo = tk.state.plan.gradeMap[zoneInfo.gradeId];

		if (!gradeInfo) {
			continue;
		}

		// 선택된 영역과 등급과 다른 비지정석은 비노출
		if ((TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE || TLG.BACKGROUND_TYPE === TLG.BG_EXTENTION_SECTION_TILE) && // 부분노출이면서
			tk.state.select.selectedBlock && // 선택된 영역이 있고
			tk.state.select.selectedGrade && // 선택된 등급이 있고
			(zoneInfo.blockId !== tk.state.select.selectedBlock.blockId || // 영역과 등급이 다르면 통과
				zoneInfo.gradeId !== tk.state.select.selectedGrade.gradeId)) {
			continue;
		}

		context.strokeStyle = gradeInfo.color;
		context.beginPath();
		//---------------------------------------------------------
		for (var i = 0; i < zoneInfo.cornerPoints.length; i++) {
			var point = zoneInfo.cornerPoints[i];
			if (i == 0) {
				context.moveTo(point.x, point.y);
			} else {
				context.lineTo(point.x, point.y);
				if (zoneInfo.cornerPoints.length - 1 === i) {
					context.lineTo(
						zoneInfo.cornerPoints[0].x, zoneInfo.cornerPoints[0].y);
				}
			}
		}
		//---------------------------------------------------------
		context.stroke();
	}


	context.strokeStyle = "rgba(0,0,0,1)";
	for (var key in tk.state.select.selectedZoneMap) {
		var zoneInfo = tk.state.select.selectedZoneMap[key];
		//console.log(zoneInfo)
		var gradeInfo = tk.state.plan.gradeMap[zoneInfo.gradeId];

		if (!gradeInfo | gradeInfo.restriction) {
			continue;
		}

		context.beginPath();
		//---------------------------------------------------------
		for (var i = 0; i < zoneInfo.cornerPoints.length; i++) {
			var point = zoneInfo.cornerPoints[i];
			if (i == 0) {
				context.moveTo(point.x, point.y);
			} else {
				context.lineTo(point.x, point.y);
				if (zoneInfo.cornerPoints.length - 1 === i) {
					context.lineTo(
						zoneInfo.cornerPoints[0].x, zoneInfo.cornerPoints[0].y);
				}
			}
		}
		//---------------------------------------------------------
		if (zoneInfo.count) {
			context.globalAlpha = 0.5;
			context.fillStyle = gradeInfo ? gradeInfo.color : this.defaultGradeColor;
			context.fill();

			if (CanvasRenderingContext2D.prototype.setLineDash) {
				context.setLineDash([]);
			}
		} else {
			if (CanvasRenderingContext2D.prototype.setLineDash) {
				context.setLineDash([14]);
			}
		}
		context.globalAlpha = 1.0;
		context.stroke();
	}
	if (CanvasRenderingContext2D.prototype.setLineDash) {
		context.setLineDash([]);
	}
};
var TLLogicalSeatLayer = Singletonify(TLLogicalSeatLayerBase);

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLAreaBackgroundLayerBase = function () {
	this.areaMapScale = 1.0;
	this.mapSize = 256;
	this.center = 128;
	this.imageUrl = '';
	this.image = new Image();
	tk.event.service.signals.s2u_updatedSelectedBlock.add(this.updatedSelectedBlockEvent.bind(this)); //선택된 영역 정보 갱신.
};

TLAreaBackgroundLayerBase.prototype.updatedSelectedBlockEvent = function () {
	//console.log("영역 선택됨.")
	//console.log(tk.state.select.getSelectedBlocks())
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

TLAreaBackgroundLayerBase.prototype.setLayerInfo = function (blockBgInfo) {
	this.mapSize = blockBgInfo.mapSize;
	this.center = blockBgInfo.center;
	var thumnailSize = TLG.isMobile ? 1024 : 2048;
	if (this.mapSize > thumnailSize) {
		this.imageUrl = blockBgInfo.imageUrlThumnail.substring(0,
			blockBgInfo.imageUrlThumnail.lastIndexOf('?') + 1);
		this.imageUrl += thumnailSize.toString() + 'x' + thumnailSize.toString();
		this.mapSize = thumnailSize;
	} else {
		this.imageUrl = blockBgInfo.imageUrl;
	}
	this.areaMapScale = this.mapSize / blockBgInfo.mapSize;
	this.center.x *= this.areaMapScale;
	this.center.y *= this.areaMapScale;
	this.image.src = this.imageUrl;
	this.image.addEventListener('error', this.failedToLoadImage.bind(this), false);
	this.image.addEventListener('load', this.loadedImage.bind(this), false);
};
TLAreaBackgroundLayerBase.prototype.setBlockInfo = function (blockMap) {
	if (!Object.keys(blockMap).length) {
		return;
	}
	// 충돌처리 블럭 blockMap
};

//-------------------------------------------------------
//  Desc : 영역 구역 활성화.
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.activateBlock = function (blockList) {

};

//-------------------------------------------------------
//  Desc : 이미지 로드 실패한 경우 재시도 과정 시작
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.failedToLoadImage = function () {
	if (TLG.COUNT_IMAGE_LOAD_AREA === 0) {
		this.retryImageloadArea();
	}
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

TLAreaBackgroundLayerBase.prototype.loadedImage = function () {
	TLEventManager.getInstance().signals.updateRender.dispatch();
};

// TLAreaBackgroundLayerBase.prototype.failedToLoadImage = function () {
// 	console.log(this.image.complete, this.image.naturalHeight, "failed to load image");
// };

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.updateLayer = function () {
	TLSVGMatrixInfo.getInstance().setChangeLayer("NORMAL", TLG.PLAN_STATE);
	TLSVGMatrixInfo.getInstance().setMapSize("NORMAL", this.mapSize);
	TLSVGMatrixInfo.getInstance().fullScreenSizeMap();
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.updateLayerByBack = function () {
	TLSVGMatrixInfo.getInstance().setChangeLayer("BACK", TLG.PLAN_STATE);
	TLSVGMatrixInfo.getInstance().setMapSize("BACK", this.mapSize);
	TLSVGMatrixInfo.getInstance().fullScreenSizeMapByBack();
};

//-------------------------------------------------------
//  Desc  :
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.setInitMatrix = function () {

};
//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.render = function (context) {
	if (this.isImageReady()) {
		this.showBlockLine(context);
		if (tk.utils.isWaitingReservation()) {
			if (tk.state.global.meta.frontPlanTypeCode === 'WAITING_APPLICATION') {
				this.showBlockFill(context);
			}
		}
		context.drawImage(this.image, 0, 0);
		return;
	}
	// 선택한 등급
	this.showBlockNoImage(context, 'fill');
	// 나머지 등급
	this.showBlockNoImage(context, 'stroke');
};

//-------------------------------------------------------
//  Desc  :  이미지 로드 여부
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.isImageReady = function () {
	return (this.image.complete && this.image.naturalHeight > 0);
};

//-------------------------------------------------------
//  Desc  :  전체 등급 블록
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.getAllBlocks = function () {
	var blockMap = tk.state.plan.blockMap;
	var fullBlockArray = new Array();
	for (var key in blockMap) {
		var blockObject = tk.state.plan.blockMap[key];
		fullBlockArray.push(blockObject);
	}
	return fullBlockArray;
};

TLAreaBackgroundLayerBase.prototype.showBlockNoImage = function (context, drawType) {
	var blockArray = drawType === 'stroke' ? this.getAllBlocks() : tk.state.select.getSelectedBlocks().blocks;
	var selectedGrade = tk.state.select.selectedGrade;
	var hasSelection = selectedGrade !== null && selectedGrade.hasOwnProperty('zones') && selectedGrade.zones.length > 0;
	if (!blockArray.length) {
		context.globalAlpha = 1.0;
		return;
	}

	context.save();
	context.globalAlpha = 1.0;
	context.beginPath();
	context.strokeStyle = '#000000';
	context.lineWidth = 5;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	for (var idx = 0; idx < blockArray.length; idx++) {
		var blockObject = blockArray[idx];
		if (!TLSVGMatrixInfo.getInstance().isContainsPointInMap(this.mapSize,
			{
				x: blockObject.linkedPoint.x * this.areaMapScale,
				y: blockObject.linkedPoint.y * this.areaMapScale
			})) {
			continue;
		}
		//---------------------------------------------------------
		for (var i = 0; i < blockObject.cornerPoints.length; i++) {
			var point = blockObject.cornerPoints[i];
			if (i == 0) {
				context.moveTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
			} else {
				context.lineTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
				if (blockObject.cornerPoints.length - 1 === i) {
					context.lineTo(
						blockObject.cornerPoints[0].x * this.areaMapScale,
						blockObject.cornerPoints[0].y * this.areaMapScale);
				}
			}
		}
		//---------------------------------------------------------
	}
	if (hasSelection && drawType === 'fill') {
		context.fillStyle = selectedGrade.color;
		context.fill();
	}
	context.stroke();
	context.clip();
	context.restore();
	context.globalAlpha = 0.2;
};

TLAreaBackgroundLayerBase.prototype.showBlockLine = function (context) {
	var blockArray = tk.state.select.getSelectedBlocks().blocks;
	if (!tk.utils.isWaitingReservation()) {
		if (tk.state.global.meta.frontPlanTypeCode !== 'WAITING_APPLICATION') {
			// [예매대기] 신청가능한 block이 없는 경우는 전체 dimmed처리 되도록
			if (!blockArray.length) {
				context.globalAlpha = 1.0;
				return;
			}
		}
	}

	context.save();
	context.globalAlpha = 1.0;
	context.beginPath();
	context.strokeStyle = '#000000';
	context.lineWidth = 5;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	for (var idx = 0; idx < blockArray.length; idx++) {
		var blockObject = blockArray[idx];
		if (!TLSVGMatrixInfo.getInstance().isContainsPointInMap(this.mapSize,
			{
				x: blockObject.linkedPoint.x * this.areaMapScale,
				y: blockObject.linkedPoint.y * this.areaMapScale
			})) {
			continue;
		}
		//---------------------------------------------------------
		for (var i = 0; i < blockObject.cornerPoints.length; i++) {
			var point = blockObject.cornerPoints[i];
			if (i == 0) {
				context.moveTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
			} else {
				context.lineTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
				if (blockObject.cornerPoints.length - 1 === i) {
					context.lineTo(
						blockObject.cornerPoints[0].x * this.areaMapScale,
						blockObject.cornerPoints[0].y * this.areaMapScale);
				}
			}
		}
		//---------------------------------------------------------
	}
	context.stroke();
	context.clip();
	context.drawImage(this.image, 0, 0);
	context.restore();
	context.globalAlpha = 0.2;
};

// [예매대기전용] 선택영역 색칠
TLAreaBackgroundLayerBase.prototype.showBlockFill = function (context) {
	var blockInfo = tk.state.plan.blockInfo;
	var sectionInGrade = tk.state.select.selectedSectionInBlockMap;
	var sectionArray = [];
	sectionInGrade.map(function (grade) {
		sectionArray = sectionArray.concat(grade.sections);
	});

	context.save();
	context.globalAlpha = 1.0;
	context.beginPath();
	context.strokeStyle = '#FFFFFF';
	context.lineWidth = 3;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	for (var idx = 0; idx < sectionArray.length; idx++) {
		var blockObject = _.find(blockInfo, function (curBlock) {
			return curBlock.blockId === sectionArray[idx].blockId;
		});
		// if (!TLSVGMatrixInfo.getInstance().isContainsPointInMap(this.mapSize,
		// 	{
		// 		x: blockObject.linkedPoint.x * this.areaMapScale,
		// 		y: blockObject.linkedPoint.y * this.areaMapScale
		// 	})) {
		// 	continue;
		// }
		//---------------------------------------------------------

		var max = {x: -1, y: -1};
		var min = {x: 99999999, y: 99999999};

		for (var i = 0; i < blockObject.cornerPoints.length; i++) {
			var point = blockObject.cornerPoints[i];
			if (point.x > max.x) {
				max.x = point.x;
			}
			if (point.x < min.x) {
				min.x = point.x;
			}
			if (point.y > max.y) {
				max.y = point.y;
			}
			if (point.y < min.y) {
				min.y = point.y;
			}

			if (i == 0) {
				context.moveTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
			} else {
				context.lineTo(point.x * this.areaMapScale, point.y * this.areaMapScale);
				if (blockObject.cornerPoints.length - 1 === i) {
					context.lineTo(
						blockObject.cornerPoints[0].x * this.areaMapScale,
						blockObject.cornerPoints[0].y * this.areaMapScale);
				}
			}
		}


		/*==== S: 체크아이콘 ====*/
		// var checkSize = 16; // 체크 아이콘의 사이즈 조정
		// var startPoint = {
		// 	x: (min.x + ((max.x - min.x) / 2)) - checkSize,
		// 	y: (min.y + ((max.y - min.y) / 2)),
		// }
		// context.moveTo(startPoint.x * this.areaMapScale, startPoint.y * this.areaMapScale);
		// context.lineTo((startPoint.x + (checkSize)) * this.areaMapScale, (startPoint.y + (checkSize)) * this.areaMapScale);
		// context.lineTo((startPoint.x + (checkSize * 2.25)) * this.areaMapScale, (startPoint.y - (checkSize * 1.25)) * this.areaMapScale);
		/*==== E: 체크아이콘 ====*/
		//---------------------------------------------------------
	}

	context.fillStyle = '#ff8700';
	context.globalAlpha = 1;
	context.fill();
	context.stroke();
	context.restore();
};

//-------------------------------------------------------
//  Desc : 첫번째 로드 실패 후 500ms 간격으로 2번 더 시도
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.retryImageloadArea = function () {
	if (TLG.COUNT_IMAGE_LOAD_AREA > 2) {
		return;
	}
	var image = this.image;
	var selfBase = this;
	var tryReloadImageArea = function () {
		TLG.COUNT_IMAGE_LOAD_AREA++;
		if (TLG.COUNT_IMAGE_LOAD_AREA > 2) {
			clearInterval(looperArea);
			return;
		}

		selfBase.reloadImage(image);
		if (selfBase.isImageReady()) {
			clearInterval(looperArea);
			return;
		}
	};

	var looperArea = setInterval(tryReloadImageArea, 500);
};

//-------------------------------------------------------
//  Desc : 이미지 로드 재시도
//-------------------------------------------------------
TLAreaBackgroundLayerBase.prototype.reloadImage = function (failedImage) {
	if ('undefined' !== typeof failedImage) {
		var srcReal = failedImage.src;
		failedImage.src = srcReal + '?';
		failedImage.src = failedImage.src.split('?')[0] + '?' + failedImage.src.split('?')[1];
	}
};

var TLAreaBackgroundLayer = Singletonify(TLAreaBackgroundLayerBase);

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLToolTipLayerBase = function () {
    this.toolTipCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    TLDomInfo.getInstance().getDomElement().appendChild(this.toolTipCanvas);
    this.toolTipContext = this.toolTipCanvas.getContext('2d');
    this.toolTipCanvas.style.position = 'absolute';
    this.toolTipCanvas.width = TLDomInfo.getInstance().getWidth();
    this.toolTipCanvas.height = TLDomInfo.getInstance().getHeight();
    this.toolTipCanvas.style.zIndex = 5;
    //this.toolTipCanvas.style.display = 'none';
    this.textArray = null;
    this.mousePoint = new Vector2();

    this.toolTipContext.font = "bold 15px Dotum";
    this.toolTipContext.fillStyle = "rgba(0,0,0,0.7)";
};

TLToolTipLayerBase.prototype.setToolTip = function (textObj, evnet) {
    if (textObj === undefined) {
        this.textArray = null;
        this.toolTipCanvas.style.display = 'none';
        return;
    }
    this.toolTipCanvas.style.display = 'block';
    this.textArray = textObj;
    this.mousePoint.x = evnet.offsetX || (evnet.pageX - this.toolTipCanvas.offsetLeft);
    this.mousePoint.y = evnet.offsetY || (evnet.pageY - this.toolTipCanvas.offsetTop);
};

TLToolTipLayerBase.prototype.getTextArrayMaxSize = function (textArray) {
    var maxTextWidth = 0;
    for (var idx = 0; idx < textArray.length; idx++) {
        var text = textArray[idx];
        maxTextWidth = Math.max(maxTextWidth, this.toolTipContext.measureText(text).width);
    }
    return maxTextWidth;
};

TLToolTipLayerBase.prototype.render = function () {
    this.toolTipContext.clearRect(0, 0,
        this.toolTipCanvas.width, this.toolTipCanvas.height);
    this.drawToolTip();
};

TLToolTipLayerBase.prototype.drawToolTip = function () {
    if (this.textArray === null) {
        return;
    }

    var widthTerm = 20;
    var heightTerm = 10;
    var textWidth = this.getTextArrayMaxSize(this.textArray) + widthTerm;
    var textHeight = 22;

    var width = Math.max(100, textWidth);
    var height = this.textArray.length * textHeight + heightTerm;
    var isRightOver = this.mousePoint.x + width > this.toolTipCanvas.width;
    var isTopOver = this.mousePoint.y - height < 0;
    var originX = this.mousePoint.x;
    var originY = this.mousePoint.y;
    var right = this.mousePoint.x + (isRightOver ? -1 * width : width);
    var top = this.mousePoint.y + (isTopOver ? height : -1 * height);
    var tailX = this.mousePoint.x + (isRightOver ? -10 : 10);
    var tailY = this.mousePoint.y + (isTopOver ? 7 : -7);
    var textLeft = isRightOver ? right + 10 : originX + 10;
    var textTop = top + (isTopOver ? -1 * 10 : 15);

    // Tooltip 박스
    this.toolTipContext.fillStyle = "rgba(0,0,0,0.7)";
    this.toolTipContext.beginPath();
    this.toolTipContext.moveTo(originX, originY);
    this.toolTipContext.lineTo(originX, top);
    this.toolTipContext.lineTo(right, top);
    this.toolTipContext.lineTo(right, tailY);
    this.toolTipContext.lineTo(tailX, tailY);
    //this.toolTipContext.closePath();
    this.toolTipContext.fill();

    // Tooltip 텍스트
    this.toolTipContext.fillStyle = "rgba(255,255,255, 1.0)";
    for (var idx = 0; idx < this.textArray.length; idx++) {
        var text = this.textArray[idx];
        var x = textLeft;
        var y = textTop + idx * (isTopOver ? -1 * textHeight : textHeight);
        this.toolTipContext.fillText(text, x, y);
    }
};

var TLToolTipLayer = Singletonify(TLToolTipLayerBase);
//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLViewController = function () {
	//var domElement = TLDomInfo.getInstance().getDomElement();

	// Hammerjs 초기화 ===================================================
	//var mc = new Hammer.Manager(TLDomInfo.getInstance().canvas);
	var domElement = TLDomInfo.getInstance().getDomElement();
	var mc = new Hammer.Manager(domElement);

	this.beforePoint = null;
	this.minDistance = 10;
	this.beforePinchTime = 0;
	this.minPinchTime = 30;

	if (!tk.state.device.isMobileDevice()) {
		domElement.addEventListener('mousewheel', this.handelMouseWheel.bind(this));
		domElement.addEventListener('mousemove', this.handelMouseMove.bind(this));
	}

	mc.options.domEvents = true;
	//mc.options.enable = false;

	var hmrPan = new Hammer.Pan({threshold: 0, direction: Hammer.DIRECTION_ALL});
	var hmrPinch = new Hammer.Pinch({threshold: 0, pointers: 0});
	hmrPinch.recognizeWith(hmrPan);
	//hmrPinch.requireFailure(hmrPan);
	if (TLG.isRotateControl) {
		var hmrRotate = new Hammer.Rotate();
		hmrRotate.recognizeWith(hmrPinch);
	}
	//var hmrSwipe = new Hammer.Swipe();
	//hmrSwipe.recognizeWith(hmrPan);
	mc.add(new Hammer.Tap());
	var hmrTap = new Hammer.Tap({event: 'doubletap', taps: 2});
	var hmrPress = new Hammer.Press();
	mc.add(hmrPan);
	//mc.add(hmrSwipe);
	if (TLG.isRotateControl) {
		mc.add(hmrRotate);
	}
	mc.add(hmrPinch);
	mc.add(hmrTap);
	mc.add(hmrPress);

	//doubleTap.requireFailure(tripleTap);
	//singleTap.requireFailure([tripleTap, doubleTap]);

	//mc.on("panstart panmove panend", this.onPan.bind(this));
	mc.on("panstart panmove panend", this.onPan.bind(this));
	//mc.on("swipe", onSwipe);
	if (TLG.isRotateControl) {
		mc.on("rotatestart rotatemove rotateend", this.onRotate.bind(this));
	}
	mc.on("pinchstart pinchmove pinchend", this.onPinch.bind(this));
	mc.on("tap doubletap", this.onTap.bind(this));
	//mc.on("doubletap", onDoubleTap);
	mc.on("press pressup", this.onPress.bind(this));
	//===============================================================
	var scope = this;
};


TLViewController.prototype.handelMouseWheel = function (event) {
	if (TLSVGMatrixInfo.getInstance().defaultAction) {
		return;
	}
	if (event.altKey) {
		if (TLG.isRotateControl) {
			TLSVGMatrixInfo.getInstance().onRotate(event);
		}
	} else {
		TLSVGMatrixInfo.getInstance().onZoom(event);
		TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
		if (!tk.utils.isWaitingReservation()) {
			// 예매대기인 경우에 도면을 움직일때 업데이트 하지 않도록 수정
			TLSVGMatrixInfo.getInstance().pagingSectorDetection();
		}
	}
	TLEventManager.getInstance().signals.updateRender.dispatch();
	TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
};
TLViewController.prototype.handelMouseMove = function (event) {

	if (TLSVGMatrixInfo.getInstance().defaultAction) {
		return;
	}

	// worldMousePosition 도출
	TLSVGMatrixInfo.getInstance().mouseMove(event);
	// 툴팁 ---------------------------------------------------------------------------

	let toolTip = null;
	let cursor = 'default';

	switch (TLG.PLAN_STATE) {
		case TLG.PLAN_AREA:
			var blockObj = TLSVGMatrixInfo.getInstance().selectAreaDetection(
				TLAreaBackgroundLayer.getInstance().areaMapScale);

			if (blockObj) {
				toolTip = tk.controller.view.getBlockTooltip(blockObj);
				cursor = 'pointer';
			}

			TLToolTipLayer.getInstance().setToolTip(toolTip, event);
			TLDomInfo.getInstance().setCursorStyle(cursor);
			break;
		case TLG.PLAN_SEAT:
			var seatInfo = TLSVGMatrixInfo.getInstance().selectSeatDetection();
			if (seatInfo) {
				toolTip = tk.controller.view.getSeatTooltip(seatInfo);
				cursor = 'pointer';
			}

			var zoneInfo = TLSVGMatrixInfo.getInstance().selectZoneDetection();
			if (zoneInfo) {
				toolTip = tk.controller.view.getZoneTooltip(zoneInfo);
				cursor = 'pointer';
			}

			TLToolTipLayer.getInstance().setToolTip(toolTip, event);
			TLDomInfo.getInstance().setCursorStyle(cursor);
			break;
	}
	//-------------------------------------------------------------------------------
	TLEventManager.getInstance().signals.updateRender.dispatch();
	TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
};

TLViewController.prototype.onRotate = function (ev) {
	if (TLSVGMatrixInfo.getInstance().defaultAction) {
		return;
	}
	if (ev.type === "rotatestart") {
		TLSVGMatrixInfo.getInstance().rotateStart(ev);
	} else if (ev.type === "rotatemove") {
		TLSVGMatrixInfo.getInstance().rotateMove(ev);
		TLEventManager.getInstance().signals.updateRender.dispatch();
		TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
	} else if (ev.type === "rotateend") {
		TLSVGMatrixInfo.getInstance().rotateEnd(ev);
	}
};

TLViewController.prototype.onPinch = function (ev) {
	if (TLSVGMatrixInfo.getInstance().defaultAction) {
		return;
	}
	if (ev.type === "pinchstart") {
		TLSVGMatrixInfo.getInstance().pinchStart(ev);
	} else if (ev.type === "pinchmove") {
		TLSVGMatrixInfo.getInstance().pinchMove(ev);
		TLEventManager.getInstance().signals.updateRender.dispatch();
		TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
	} else if (ev.type === "pinchend") {
		TLSVGMatrixInfo.getInstance().pinchEnd(ev);
	}
};

TLViewController.prototype.onPan = function (ev) {
	if (TLSVGMatrixInfo.getInstance().defaultAction) {
		return;
	}
	if (ev.type === "panstart") {
		TLSVGMatrixInfo.getInstance().panStart(ev);
		this.setBeforePointWhenPanStart(ev);
	} else if (ev.type === "panmove") {
		TLSVGMatrixInfo.getInstance().panMove(ev);
		TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
		TLEventManager.getInstance().signals.updateRender.dispatch();
		TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
	} else if (ev.type === "panend") {
		TLSVGMatrixInfo.getInstance().panEnd(ev);

		if (!tk.utils.isWaitingReservation()) {
			// 예매대기인 경우에 도면을 움직일때 업데이트 하지 않도록 수정
			TLSVGMatrixInfo.getInstance().pagingSectorDetection();
		}
		TLEventManager.getInstance().signals.updateRender.dispatch();
		TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();

		this.onTapAfterPanEnd(ev);
	}
};

TLViewController.prototype.onTap = function (event) {
	if (tk.state.device.isMobileDevice()) {
		// worldMousePosition 도출
		TLSVGMatrixInfo.getInstance().mouseMove(event);
	}
	switch (TLG.PLAN_STATE) {
		case TLG.PLAN_AREA:
			var blockObj = TLSVGMatrixInfo.getInstance().selectAreaDetection(
				TLAreaBackgroundLayer.getInstance().areaMapScale);
			if (blockObj != null) {
				TLEventManager.getInstance().signals.c2a_selectBlockEvent.dispatch(blockObj);
			}
			break;
		case TLG.PLAN_SEAT:
			// if (TLSVGMatrixInfo.getInstance().scale <= 0.8) {
			// 	try {
			// 		TLSVGMatrixInfo.getInstance().uiAutoZoomIn(
			// 			event.srcEvent.offsetX, event.srcEvent.offsetY
			// 		);
			// 		return;
			// 	} catch (e) {
			// 		console.log('e', e);
			// 	}
			// }

			var seatInfo = TLSVGMatrixInfo.getInstance().selectSeatDetection();
			if (seatInfo != null) {
				TLEventManager.getInstance().signals.c2a_selectSeatEvent.dispatch(seatInfo);
			}
			var zoneInfo = TLSVGMatrixInfo.getInstance().selectZoneDetection();
			if (zoneInfo != null) {
				TLEventManager.getInstance().signals.c2a_selectZoneEvent.dispatch(zoneInfo);
			}
			break;
	}
};

TLViewController.prototype.onPress = function (ev) {
	//console.log(ev)
	// console.log("press")
};

//-------------------------------------------------------
//  Desc : LG 최신 단말기 민감도로 인한 문제 때문에 추가 로직
//
//  Pan Start 때 이전 포인트를 저장(단, Pinch End 직후에는 저장하지 않는다.)
//-------------------------------------------------------
TLViewController.prototype.setBeforePointWhenPanStart = function (ev) {
	if (!tk.state.device.isMobileDevice()) {
		return;
	}

	if (new Date().getTime() - this.beforePinchTime > this.minPinchTime) {
		this.beforePoint = ev.center;
	}
};

//-------------------------------------------------------
//  Desc : touchstart와 touchend Event에 대한 클릭이벤트 처리 로직
//  Pan Start 와 Pan End 의 거리차가 최소 거리차보다 작으면 Tap 으로 인지
//-------------------------------------------------------
TLViewController.prototype.onTapAfterPanEnd = function (ev) {
	if (!this.beforePoint) {
		return;
	}

	var dx = ev.center.x - this.beforePoint.x;
	var dy = ev.center.y - this.beforePoint.y;
	var distance = dx * dx + dy * dy;

	if (distance < this.minDistance) {
		TLViewController.prototype.onTap(ev);
	}

	this.beforePoint = null;
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLMobileViewController = function () {
  var scope = this;
  //var domElement = TLDomInfo.getInstance().getDomElement();

  this.beforePoint = null;
  this.minDistance = 10;
  this.beforePinchTime = 0;
  this.minPinchTime = 30;

  // Hammerjs 초기화 ===================================================
  //var mc = new Hammer.Manager(TLDomInfo.getInstance().canvas);
  var mc = new Hammer.Manager(TLDomInfo.getInstance().getDomElement());
  mc.options.domEvents = true;
  //mc.options.enable = false;

  var hmrPan = new Hammer.Pan({
    threshold: 0,
    direction: Hammer.DIRECTION_ALL,
  });
  var hmrPinch = new Hammer.Pinch({ threshold: 0, pointers: 0 });
  hmrPinch.recognizeWith(hmrPan);
  //hmrPinch.requireFailure(hmrPan);
  if (TLG.isRotateControl) {
    var hmrRotate = new Hammer.Rotate();
    hmrRotate.recognizeWith(hmrPinch);
  }
  //var hmrSwipe = new Hammer.Swipe();
  //hmrSwipe.recognizeWith(hmrPan);
  mc.add(new Hammer.Tap());
  var hmrTap = new Hammer.Tap({ event: "doubletap", taps: 2 });
  var hmrPress = new Hammer.Press();
  mc.add(hmrPan);
  //mc.add(hmrSwipe);
  if (TLG.isRotateControl) {
    mc.add(hmrRotate);
  }
  mc.add(hmrPinch);
  mc.add(hmrTap);
  mc.add(hmrPress);

  mc.add(hmrTap);

  //mc.on("panstart panmove panend", this.onPan.bind(this));
  mc.on("panstart panmove panend", this.onPan.bind(this));
  //mc.on("swipe", onSwipe);
  if (TLG.isRotateControl) {
    mc.on("rotatestart rotatemove rotateend", this.onRotate.bind(this));
  }
  mc.on("pinchstart pinchmove pinchend", this.onPinch.bind(this));

  var el = TLDomInfo.getInstance().getDomElement();

  var clientPosition = {
    x: 0,
    y: 0,
  };
  var isClickEventDoing = false;
  el.addEventListener("touchstart", function (event) {
    var clientX = event.changedTouches[0].clientX;
    var clientY = event.changedTouches[0].clientY;
    clientPosition.x = clientX;
    clientPosition.y = clientY;

    // console.log(`touchStart coordinate [${clientPosition.x}, ${clientPosition.y}]`)
  });
  el.addEventListener("touchend", function (event) {
    var clientX = event.changedTouches[0].clientX;
    var clientY = event.changedTouches[0].clientY;
    var x = Math.abs(clientPosition.x - clientX);
    var y = Math.abs(clientPosition.y - clientY);

    // console.log(`touchEnd coordinate [${clientX}, ${clientX}]`);
    // console.log(`FIXED coordinate [${x}, ${y}]`)

    const allowTouchRange = 3;
    if (x <= allowTouchRange && y <= allowTouchRange) {
      var rect = event.target.getBoundingClientRect();
      event.center = { x: clientX, y: clientY };
      event.srcEvent = {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top,
      };
      // console.log(`fixed coordinate [${event.srcEvent.offsetX},${event.srcEvent.offsetY}]`)
      scope.onTap.call(scope, event);
    }
  });

  // $(el).bind("tap", function (ev) {
  //   console.log("tap");
  //   // Back Button Handling
  //   if (!scope.isEventAllowed(ev)) {
  //     return;
  //   }
  //
  //   var rect = event.target.getBoundingClientRect();
  //   ev.center = { x: ev.clientX, y: ev.clientY };
  //   ev.srcEvent = {
  //     offsetX: ev.clientX - rect.left,
  //     offsetY: ev.clientY - rect.top,
  //   };
  //   console.log("ev", ev);
  //   scope.onTap.call(scope, ev);
  // });

  mc.on("press pressup", this.onPress.bind(this));
  //===============================================================
};

TLMobileViewController.prototype.onRotate = function (ev) {
  if (!this.isEventAllowed(ev)) {
    return;
  }
  if (TLSVGMatrixInfo.getInstance().defaultAction) {
    return;
  }
  if (ev.type === "rotatestart") {
    TLSVGMatrixInfo.getInstance().rotateStart(ev);
  } else if (ev.type === "rotatemove") {
    TLSVGMatrixInfo.getInstance().rotateMove(ev);
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  } else if (ev.type === "rotateend") {
    TLSVGMatrixInfo.getInstance().rotateEnd(ev);
  }
};

TLMobileViewController.prototype.onPinch = function (ev) {
  if (!this.isEventAllowed(ev)) {
    return;
  }
  if (TLSVGMatrixInfo.getInstance().defaultAction) {
    return;
  }
  if (ev.type === "pinchstart") {
    TLSVGMatrixInfo.getInstance().pinchStart(ev);
  } else if (ev.type === "pinchmove") {
    TLSVGMatrixInfo.getInstance().pinchMove(ev);
    TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  } else if (ev.type === "pinchend") {
    TLSVGMatrixInfo.getInstance().pinchEnd(ev);
    TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
    if (!tk.utils.isWaitingReservation()) {
      // 예매대기인 경우에 도면을 움직일때 업데이트 하지 않도록 수정
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
    }
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
    this.beforePinchTime = new Date().getTime();
  }
};

TLMobileViewController.prototype.onPan = function (ev) {
  if (!this.isEventAllowed(ev)) {
    return;
  }
  if (TLSVGMatrixInfo.getInstance().defaultAction) {
    return;
  }
  if (ev.type === "panstart") {
    TLSVGMatrixInfo.getInstance().panStart(ev);

    this.setBeforePointWhenPanStart(ev);
  } else if (ev.type === "panmove") {
    TLSVGMatrixInfo.getInstance().panMove(ev);
    TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  } else if (ev.type === "panend") {
    TLSVGMatrixInfo.getInstance().panEnd(ev);

    TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
    if (!tk.utils.isWaitingReservation()) {
      // 예매대기인 경우에 도면을 움직일때 업데이트 하지 않도록 수정
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
    }
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();

    this.onTapAfterPanEnd(ev);
  }
};

TLMobileViewController.prototype.onTap = function (event) {
  if (!this.isEventAllowed(event)) {
    return;
  }

  switch (TLG.PLAN_STATE) {
    case TLG.PLAN_AREA:
      var blockObj = TLSVGMatrixInfo.getInstance().selectAreaDetection(
        TLAreaBackgroundLayer.getInstance().areaMapScale,
        event
      );
      if (blockObj != null) {
        TLEventManager.getInstance().signals.c2a_selectBlockEvent.dispatch(
          blockObj
        );
      }
      break;
    case TLG.PLAN_SEAT:
      // if (TLSVGMatrixInfo.getInstance().scale <= 0.8) {
      //   try {
      //     var rect = event.target.getBoundingClientRect();
      //     var offset = {};
      //     if (event.pageX) {
      //       offset.x = event.pageX - rect.left;
      //       offset.y = event.pageY - rect.top;
      //     } else {
      //       offset.x = event.srcEvent.offsetX;
      //       offset.y = event.srcEvent.offsetY;
      //     }
      //
      //     TLSVGMatrixInfo.getInstance().uiAutoZoomIn(offset.x, offset.y, event);
      //     return;
      //   } catch (e) {
      //     console.log("e", e);
      //   }
      // }

      var seatInfo = TLSVGMatrixInfo.getInstance().selectSeatDetection(event);
      if (seatInfo != null) {
        TLEventManager.getInstance().signals.c2a_selectSeatEvent.dispatch(
          seatInfo
        );
      }
      var zoneInfo = TLSVGMatrixInfo.getInstance().selectZoneDetection(event);
      if (zoneInfo != null) {
        TLEventManager.getInstance().signals.c2a_selectZoneEvent.dispatch(
          zoneInfo
        );
      }
      break;
  }
};

TLMobileViewController.prototype.onPress = function (ev) {
  //console.log(ev)
};

//-------------------------------------------------------
//  Desc : LG 최신 단말기 민감도로 인한 문제 때문에 추가 로직
//
//  Pan Start 때 이전 포인트를 저장(단, Pinch End 직후에는 저장하지 않는다.)
//-------------------------------------------------------
TLMobileViewController.prototype.setBeforePointWhenPanStart = function (ev) {
  if (!tk.state.device.isAOSLGMobileApp()) {
    return;
  }

  if (new Date().getTime() - this.beforePinchTime > this.minPinchTime) {
    this.beforePoint = ev.center;
  }
};

//-------------------------------------------------------
//  Desc : touchstart와 touchend Event에 대한 클릭이벤트 처리 로직
//  Pan Start 와 Pan End 의 거리차가 최소 거리차보다 작으면 Tap 으로 인지
//-------------------------------------------------------
TLMobileViewController.prototype.onTapAfterPanEnd = function (ev) {
  if (!this.beforePoint) {
    return;
  }

  var dx = ev.center.x - this.beforePoint.x;
  var dy = ev.center.y - this.beforePoint.y;
  var distance = dx * dx + dy * dy;

  if (distance < this.minDistance) {
    TLMobileViewController.prototype.onTap(ev);
  }

  this.beforePoint = null;
};

TLMobileViewController.prototype.isEventAllowed = function (event) {
  if (event.target.className.indexOf("back_btn") > -1) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    return false;
  }
  return true;
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLMiniMapViewController = function () {
	// Hammerjs 초기화 ===================================================
	this.canvas = TLMiniMapLayer.getInstance().miniMapCanvas; //미니맵 캔버스
	var mc = new Hammer.Manager(this.canvas);
	mc.options.domEvents = true;
	//mc.options.enable = false;
	var hmrPan = new Hammer.Pan({threshold: 0, direction: Hammer.DIRECTION_ALL});
	//hmrPinch.requireFailure(hmrPan);
	mc.add(new Hammer.Tap());
	var hmrTap = new Hammer.Tap({event: 'doubletap', taps: 2});
	var hmrPress = new Hammer.Press();
	mc.add(hmrPan);
	mc.add(hmrTap);
	mc.add(hmrPress);
	//doubleTap.requireFailure(tripleTap);
	//singleTap.requireFailure([tripleTap, doubleTap]);
	mc.on("panstart panmove panend", this.onPan.bind(this));
	mc.on("tap doubletap", this.onTap.bind(this));
	//mc.on("doubletap", onDoubleTap);
	mc.on("press pressup", this.onPress.bind(this));
	//===============================================================
};

TLMiniMapViewController.prototype.onPan = function (ev) {
	////if (TLSVGMatrixInfo.getInstance().defaultAction) {
	////    return;
	////}
	////if (ev.type === "panstart") {
	////    TLSVGMatrixInfo.getInstance().panStart(ev);
	////}
	////else if (ev.type === "panmove") {
	////    TLSVGMatrixInfo.getInstance().panMove(ev);
	////    //TLSVGMatrixInfo.getInstance().pagingSectorDetection();
	////    //TLEventManager.getInstance().signals.updateRender.dispatch();
	////    //TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
	////}
	////else if (ev.type === "panend") {
	////    TLSVGMatrixInfo.getInstance().panEnd(ev);
	////}
	//var offsetX = ev.srcEvent.offsetX;
	//var offsetY = ev.srcEvent.offsetY;
	//console.log("%d, %d", offsetX, offsetY);
};
TLMiniMapViewController.prototype.onTap = function (ev) {
	this.miniMapWarp(ev);
};
TLMiniMapViewController.prototype.onPress = function (ev) {
	if (ev.type === "pressup") {
		this.miniMapWarp(ev);
	}
};

TLMiniMapViewController.prototype.miniMapWarp = function (ev) {

	if ((TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE && TLG.PLAN_STATE === TLG.PLAN_SEAT)
		|| TLG.isMobile) {
		return;
	}
	var offsetX = ev.srcEvent.offsetX;
	var offsetY = ev.srcEvent.offsetY;

	var scale = (TLG.PLAN_STATE === TLG.PLAN_AREA ?
		TLMiniMapLayer.getInstance().areaMapScale : TLMiniMapLayer.getInstance().mapScale);
	var vPos = new Vector2(offsetX / scale, offsetY / scale);
	TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", vPos.x, vPos.y);

	if (TLG.PLAN_STATE === TLG.PLAN_SEAT) {
		TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
		TLSVGMatrixInfo.getInstance().pagingSectorDetection();
	}

	TLEventManager.getInstance().signals.updateRender.dispatch();
	TLMiniMapLayer.getInstance().render();
};
//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var domElementInfo = function (domElement) {
  this.domElement = domElement;
  this.width = this.domElement.clientWidth;
  this.height = this.domElement.clientHeight;
  this.aspect = this.width / this.height;
  this.frustumSize = this.height;

  this.canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  this.domElement.appendChild(this.canvas);
  this.context = this.canvas.getContext('2d');
  this.canvas.style.position = 'absolute';
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.canvas.style.zIndex = 0;
  this.canvas.style.display = 'none';

  this.areaCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  this.domElement.appendChild(this.areaCanvas);
  this.areaContext = this.areaCanvas.getContext('2d');
  this.areaCanvas.style.position = 'absolute';
  this.areaCanvas.width = this.width;
  this.areaCanvas.height = this.height;
  this.areaCanvas.style.zIndex = 4;
  this.areaCanvas.style.display = 'none';


  this.debugCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  this.debugContext = this.debugCanvas.getContext('2d');
  this.debugCanvas.style.position = 'absolute';
  this.domElement.appendChild(this.debugCanvas);
  this.debugCanvas.width = 200;
  this.debugCanvas.height = 100;
  this.debugCanvas.style.zIndex = 5;
  this.debugCanvas.style.display = TLG.isDebug ? 'block' : 'none';

  //this.checkCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  //this.domElement.appendChild(this.checkCanvas);
  //this.checkContext = this.checkCanvas.getContext('2d');
  //this.checkCanvas.style.position = 'absolute';
  //this.checkCanvas.width = this.width;
  //this.checkCanvas.height = this.height;
  ////this.checkCanvas.style.zIndex = 10;
  ////this.checkCanvas.style.display = 'none';
};

domElementInfo.prototype.updateDomElement = function () {
  this.width = this.domElement.clientWidth;
  this.height = this.domElement.clientHeight;

  if (tk.state.device.isMobile()) {
    if (tk.utils.isWaitingReservation()) {
      if (tk.state.waitingDetail.isReservationTypeSection()) {
        // 구역형인 경우
        const sectionArea = document.getElementsByClassName('select_section_area');
        if (sectionArea[0]) {
          this.height -= sectionArea[0].clientHeight;
        }
      } else {
        const seatArea = document.getElementsByClassName('select_seat_area');
        if (seatArea[0]) {
          this.height -= seatArea[0].clientHeight;
        }
      }
    } else {
      const selectGradeArea = document.getElementsByClassName('select_grade_area');
      if (selectGradeArea[0]) {
        this.height -= selectGradeArea[0].clientHeight;
      }
    }
  }

  this.aspect = this.width / this.height;
  this.frustumSize = this.height;

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.areaCanvas.width = this.width;
  this.areaCanvas.height = this.height;

};

domElementInfo.prototype.getDomElement = function () {
  return this.domElement;
};

domElementInfo.prototype.getWidth = function () {
  return this.width;
};

domElementInfo.prototype.getHeight = function () {
  return this.height;
};

domElementInfo.prototype.getAspect = function () {
  this.aspect = this.width / this.height;
  return this.aspect;
};

domElementInfo.prototype.getFrustumSize = function () {
  return this.frustumSize;
};

domElementInfo.prototype.getHeaderAreaHeight = function () {
  return document.querySelector('#header').offsetHeight + document.querySelector('.reserve_prdt_info').offsetHeight;
}

domElementInfo.prototype.setCursorStyle = function (cursor) {
  if (!this.domElement) {
    return;
  }

  const currentCursor = this.domElement.style.cursor;
  if (currentCursor === cursor) {
    return;
  }

  switch (cursor) {
    case 'pointer':
      this.domElement.style.cursor = 'pointer';
      break;
    case 'default':
    default:
      this.domElement.style.cursor = 'default';
  }
}

var TLDomInfo = Singletonify(domElementInfo);

//-------------------------------------------------------
//  Desc : 모바일 전용 grade Tab Dom Element
//-------------------------------------------------------
var mobileDomElementInfo = function (domElement) {
	this.domElement = domElement;
	this.height = this.domElement.clientHeight;
	this.isMobileSeatLayerOpen = true;
};

mobileDomElementInfo.prototype.updateDomElement = function () {
	this.height = this.domElement.clientHeight;
};

var TLMobileDomInfo = Singletonify(mobileDomElementInfo);

//-------------------------------------------------------
//  Desc : canvas의 좌표계 관련 class
//-------------------------------------------------------
var TLCheckBoundaryBase = function () {
	this.canvas = TLDomInfo.getInstance().checkCanvas;
	this.context = TLDomInfo.getInstance().checkContext;

	this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	this.checkMatrix = this.svg.createSVGMatrix();
	this.scaleMatrix = this.svg.createSVGMatrix();
	this.translateMatrix = this.svg.createSVGMatrix();

	this.baseScreenPosition = new Vector2(0, 0);
	this.worldMousePos = new Vector2();
	this.pickingPos = new Vector2();
	this.checkAABB = new Box2();
	this.pt = this.svg.createSVGPoint();
	this.scale = 1.0;
	this.position = new Vector2();
	this.movePos = new Vector2();
};

TLCheckBoundaryBase.prototype.setPickingPos = function (x, y) {
	this.pickingPos.copy(this.transformedPoint(x, y));
};

TLCheckBoundaryBase.prototype.setWorldMousePos = function (x, y) {
	this.worldMousePos.copy(this.transformedPoint(x, y));
};

TLCheckBoundaryBase.prototype.transformedPoint = function (x, y) {
	if (this.checkMatrix.a === 0 || this.checkMatrix.d === 0) {
		return new Vector2();
	}
	this.pt.x = x;
	this.pt.y = y;

	var vResult = this.pt.matrixTransform(this.checkMatrix.inverse());
	return new Vector2(vResult.x, vResult.y);
};

TLCheckBoundaryBase.prototype.setAffineTransform = function (scale, vPivot) {
	this.scaleMatrix.a = scale;
	this.scaleMatrix.d = scale;

	this.translateMatrix.e = -this.pickingPos.x;
	this.translateMatrix.f = -this.pickingPos.y;

	this.checkMatrix = this.scaleMatrix.multiply(this.translateMatrix);

	// 결국 pivot은 스크린 이동.
	this.checkMatrix.e += vPivot.x;
	this.checkMatrix.f += vPivot.y;

	return this.context.setTransform(
		this.checkMatrix.a,
		this.checkMatrix.b,
		this.checkMatrix.c,
		this.checkMatrix.d,
		this.checkMatrix.e,
		this.checkMatrix.f);
};


TLCheckBoundaryBase.prototype.updateAABB = function (box, radius, radian) {
	//console.log(Math.cos(radian))
	var size = box.getSize();
	var x = Math.max(size.x, size.y);
	var y = Math.min(size.x, size.y);

	this.checkAABB.setFromCenterAndSize(new Vector2(x, y), box.getSize());
	// console.log(this.checkAABB)
	//this.checkAABB
};

TLCheckBoundaryBase.prototype.isPanStart = function (x, y) {
	this.baseScreenPosition = this.transformedPoint(x, y);
};

TLCheckBoundaryBase.prototype.isPanMove = function (x, y) {
	var pt = this.transformedPoint(x, y);
	this.movePos.x = pt.x - this.baseScreenPosition.x;
	this.movePos.y = pt.y - this.baseScreenPosition.y;
	this.checkMatrix = this.checkMatrix.translate(this.movePos.x, this.movePos.y);
	this.context.translate(this.movePos.x, this.movePos.y);
};


TLCheckBoundaryBase.prototype.render = function () {

	this.context.strokeStyle = '#00FF00';
	this.context.lineWidth = 4;
	this.context.lineCap = 'round';
	this.context.lineJoin = 'round';

	var p1 = this.transformedPoint(0, 0);
	var p2 = this.transformedPoint(
		TLDomInfo.getInstance().getWidth(),
		TLDomInfo.getInstance().getHeight());
	this.context.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

	var vSize = this.checkAABB.getSize();
	this.context.strokeRect(this.checkAABB.min.x, this.checkAABB.min.y,
		vSize.y, vSize.x);

	//this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
};

var TLCheckBoundary = Singletonify(TLCheckBoundaryBase);
//-------------------------------------------------------
//  Desc : canvas의 좌표계 관련 class
//-------------------------------------------------------
var TLSVGMatrixInfoBase = function () {
  this.canvas = TLDomInfo.getInstance().canvas;
  this.context = TLDomInfo.getInstance().context;

  this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.svgMatrix = this.svg.createSVGMatrix();
  this.checkSvgMatrix = this.svg.createSVGMatrix();
  this.sectionWorldMatrix = this.svg.createSVGMatrix();
  this.pt = this.svg.createSVGPoint();

  this.svgMatrixScale = this.svg.createSVGMatrix();
  this.svgMatrixRotate = this.svg.createSVGMatrix();
  this.svgMatrixTransrate = this.svg.createSVGMatrix();
  //this.savedTransforms = [];

  this.wheelTime = null;
  this.worldScreenRadius = 10;
  this.worldCenterPosition = new Vector2();
  this.oldWorldCenterPosition = new Vector2();
  this.worldMousePosition = new Vector2();
  this.pickWorldPosition = new Vector2();
  this.basePosition = new Vector2();
  this.pickTermSpace = new Vector2();
  this.baseRotateDegree = 0;
  this.pickingPoint = new Vector2();
  this.position = new Vector2();

  this.baseScreenPosition = new Vector2();
  // 미니맵을 위해.
  this.screenToWorldBox = { LT: 0, LB: 0, RT: 0, RB: 0 };  //스크린box를 월드좌표로 변환한 박스.
  this.moveScreenToWorldBoundary = {
    LT: new Vector2(),
    LB: new Vector2(),
    RT: new Vector2(),
    RB: new Vector2()
  };

  this.radian = 0.0;

  this.baseScale = 1.0;
  this.scale = 1.0;

  this.scaleMin = 0.5;
  this.scaleStaticMin = 0.25;
  this.scaleMax = 5.0;
  this.scaleStaticMax = 10.0;

  this.savedScale = 1.0;
  this.savedX = 0;
  this.savedY = 0;

  this.startPan = false;
  this.outAccelerValue = -1.0;
  this.moveVector = new Vector2();
  this.moveBoundaryCenter = new Vector2();
  this.moveBoundary = new Box2();
  this.moveBoundaryRadius = 1.0;
  this.screenBox = new Box2();
  this.screenBoundary = new Box2();
  this.screenBoundaryArray = [
    new Vector2(this.screenBoundary.min.x, this.screenBoundary.min.y), // LT
    new Vector2(this.screenBoundary.min.x, this.screenBoundary.max.y), // LB
    new Vector2(this.screenBoundary.max.x, this.screenBoundary.min.y), // RT
    new Vector2(this.screenBoundary.max.x, this.screenBoundary.max.y)  // RB
  ];

  this.screenMinSize = 256;

  // 실제 도면 사이즈.
  this.mapSize = 256;
  this.mapBoundary = new Box2();
  this.mapBoundary.min.x = this.mapBoundary.min.y = 0;
  this.mapBoundary.max.x = this.mapBoundary.max.y = this.mapSize;
  // mapBoundary는 조금 크게 만든다. -2정도


  // world 좌표 관련.
  this.cullingBoundary = { left: 0, top: 0, right: 0, bottom: 0 };
  this.cullingBox = new Box2();

  this.defaultActionTime = 100;
  this.defaultAction = null;
  this.ticking = false;
  this.defaultTransform = {
    a: 1, b: 0, c: 0,
    d: 1, e: 0, f: 0
  };

  this.animationRenderFlag = false;
  //====================================================================================================

  //====================================================================================================

  var scope = this;

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function onKeyDown(event) {
    switch (event.keyCode) {
      case 32:	// Space
        break;
    }
  }

  function onKeyUp(event) {

  }
};

TLSVGMatrixInfoBase.prototype.setChangeLayer = function (eventType, state) {
  switch (state) {
    case TLG.PLAN_AREA:
      this.canvas = TLDomInfo.getInstance().areaCanvas;
      this.context = TLDomInfo.getInstance().areaContext;
      break;
    case TLG.PLAN_SEAT:
      this.canvas = TLDomInfo.getInstance().canvas;
      this.context = TLDomInfo.getInstance().context;
      break;
  }

  if (eventType === 'BACK') {
    this.radian = 0.0;
    this.scale = this.savedScale;
  } else {
    this.radian = 0.0;
    this.scale = 1.0;
    this.svgMatrix.a = 1;
    this.svgMatrix.b = 0;
    this.svgMatrix.c = 0;
    this.svgMatrix.d = 1;
    this.svgMatrix.e = 0;
    this.svgMatrix.f = 0;
    return this.context.setTransform(1, 0, 0, 1, 0, 0);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------------------------------------
//  Desc  : {target: this.scaleMin, startTime: new Date()}
//----------------------------------------------------------
TLSVGMatrixInfoBase.prototype.setDefaultAction = function (param) {
  this.defaultAction = requestAnimationFrame(function () {
    TLSVGMatrixInfo.getInstance().setDefaultAction(param);
  });

  // 위치 보간,
  if (typeof (param.target) === 'object') {
    var t = (new Date() - param.startTime) / this.defaultActionTime;
    //var vOri = new Vector2(this.getMatrix().e, this.getMatrix().f);
    var vOri = this.worldCenterPosition;
    var vPos = this.lerpVector2(vOri, param.target, t);
    if (t > 1.0) {
      vPos = param.target;
      cancelAnimationFrame(this.defaultAction);
      this.defaultAction = null;
    }
    this.setWarpWorld('NORMAL', vPos.x, vPos.y);
    //this.translate(pt.x - this.basePosition.x, pt.y - this.basePosition.y);
    //this.updateSquareBoundary();
    //this.updateWorldMatrix();
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  }
  // scale 보간.
  else {
    var t = (new Date() - param.startTime) / this.defaultActionTime;
    var scale = this.lerpScale(this.scale, param.target, t);
    if (t > 1.0) {
      scale = param.target;
      this.scale = param.target;
      cancelAnimationFrame(this.defaultAction);
      this.defaultAction = null;
    }
    this.translate(this.basePosition.x, this.basePosition.y);
    this.setScale(scale, scale);
    this.translate(-this.basePosition.x, -this.basePosition.y);

    //this.updateWorldMatrix();
    TLEventManager.getInstance().signals.updateRender.dispatch();
    TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  }
};
//-----------------------------------------------
//  Desc  : view 동작 관련. (pc/mobile 이벤트 분기)
//-----------------------------------------------
//-----------------------------------------------
//  Desc  : pc에서만 동작
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.mouseMove = function (event) {
  var lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
  var lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
  this.worldMousePosition.copy(this.transformedPoint(lastX, lastY));
  //TLCheckBoundary.getInstance().setWorldMousePos(lastX, lastY);
  return this.worldMousePosition;
};
//-------------------------------------------------------
//  Desc : move
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.panStart = function (ev, isDomEvent) {
  this.startPan = true;
  if (isDomEvent) {
    this.wheelTime = 0;
    var lastX = ev.offsetX || (ev.pageX - this.canvas.offsetLeft);
    var lastY = ev.offsetY || (ev.pageY - this.canvas.offsetTop);
    this.baseScreenPosition.set(lastX, lastY);
    this.basePosition = this.transformedPoint(lastX, lastY);
    //TLCheckBoundary.getInstance().isPanStart(lastX, lastY);
  } else {
    this.baseScreenPosition.set(ev.deltaX, ev.deltaY);
    this.basePosition = this.transformedPoint(ev.deltaX, ev.deltaY);
    //TLCheckBoundary.getInstance().isPanStart(ev.deltaX, ev.deltaY);
  }
};
TLSVGMatrixInfoBase.prototype.panMove = function (ev, isDomEvent) {
  if (!this.startPan) {
    //var lastX = ev.offsetX || (ev.pageX - this.canvas.offsetLeft);
    //var lastY = ev.offsetY || (ev.pageY - this.canvas.offsetTop);
    //this.worldMousePosition.copy(this.transformedPoint(lastX, lastY));
    return false;
  }
  if (isDomEvent) {
    var lastX = ev.offsetX || (ev.pageX - this.canvas.offsetLeft);
    var lastY = ev.offsetY || (ev.pageY - this.canvas.offsetTop);

    var pt = this.transformedPoint(lastX, lastY);
    //TLCheckBoundary.getInstance().isPanMove(lastX, lastY);
    var moveVector = { x: pt.x - this.basePosition.x, y: pt.y - this.basePosition.y };
    if (!this.updateMoveBoundary(moveVector.x, moveVector.y)) {
      var accelerValue = this.outAccelerValue > 0 ? 50 / this.outAccelerValue : 1;
      this.translate(moveVector.x * accelerValue, moveVector.y * accelerValue);
      //return;
    } else {
      this.translate(moveVector.x, moveVector.y);
    }
    //this.updateSquareBoundary();
    //this.updateWorldMatrix();
  } else {
    var pt = this.transformedPoint(ev.deltaX, ev.deltaY);
    var moveVector = { x: pt.x - this.basePosition.x, y: pt.y - this.basePosition.y };
    //TLCheckBoundary.getInstance().isPanMove(ev.deltaX, ev.deltaY);
    if (!this.updateMoveBoundary(moveVector.x, moveVector.y)) {
      var accelerValue = this.outAccelerValue > 0 ? 50 / this.outAccelerValue : 1;
      this.translate(moveVector.x * accelerValue, moveVector.y * accelerValue);
      //return;
    } else {
      this.translate(moveVector.x, moveVector.y);
    }
    //this.updateSquareBoundary();
    //this.updateWorldMatrix();
  }
  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
};
TLSVGMatrixInfoBase.prototype.panEnd = function (ev, isDomEvent) {
  this.basePosition.copy(this.position);
  this.startPan = false;

  if (this.outAccelerValue > 0) {
    this.setDefaultAction({
      target: this.oldWorldCenterPosition,
      startTime: new Date()
    });
  }
};

//-------------------------------------------------------
//  Desc : rotate
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.rotateStart = function (ev) {
  this.baseRotateDegree = ev.rotation - (this.radian * 180 / Math.PI);
  // 화면보다 작은 맵은 중앙기준.
  if (this.screenMinSize > this.mapSize) {
    this.pickingPoint.copy(this.screenBox.getCenter());
    this.baseScale = this.scale;
    this.basePosition.copy(this.pickingPoint);

    this.pickTermSpace.x = this.pickingPoint.x;
    this.pickTermSpace.y = this.pickingPoint.y;
    this.worldMousePosition.copy(this.transformedPoint(this.pickingPoint.x, this.pickingPoint.y));
    this.pickWorldPosition.copy(this.worldMousePosition);
  } else {
    this.pickingPoint.x = ev.center.x;
    this.pickingPoint.y = ev.center.y - TLDomInfo.getInstance().getDomElement().offsetTop;
    this.baseScale = this.scale;
    this.basePosition = this.transformedPoint(this.pickingPoint.x, this.pickingPoint.y);

    this.pickTermSpace.x = this.pickingPoint.x;
    this.pickTermSpace.y = this.pickingPoint.y;
    this.worldMousePosition.copy(this.basePosition);
    this.pickWorldPosition.copy(this.worldMousePosition);
  }
};
TLSVGMatrixInfoBase.prototype.rotateMove = function (ev) {
  var degree = ev.rotation - this.baseRotateDegree;
  var radian = degree * Math.PI / 180;
  this.radian = radian;
  //-------------------------------------------------------------------
  // 두개가 같이 돌아가면 힘들어요.
  // rotateMove 와 pinchMove 중 마지막에 호출되는 함수에서만 콜해주세요.
  this.setAffineTransform(this.scale, this.radian,
    { x: this.pickWorldPosition.x, y: this.pickWorldPosition.y },
    this.pickTermSpace);
  //-------------------------------------------------------------------

  //this.translate(this.basePosition.x, this.basePosition.y);
  ////this.rotate(radian);
  //this.rotate(Math.PI / 18);
  //this.translate(-this.basePosition.x, -this.basePosition.y);

  //  this.updateSquareBoundary();
  //  this.updateWorldMatrix();
};
TLSVGMatrixInfoBase.prototype.rotateEnd = function (ev) {

};

//-------------------------------------------------------
//  Desc : scale
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.pinchStart = function (ev) {
  // 화면보다 작은 맵은 중앙기준.
  if (this.screenMinSize > this.mapSize) {
    this.pickingPoint.copy(this.screenBox.getCenter());
    this.baseScale = this.scale;
    this.basePosition.copy(this.pickingPoint);

    this.pickTermSpace.x = this.pickingPoint.x;
    this.pickTermSpace.y = this.pickingPoint.y;
    this.worldMousePosition.copy(this.transformedPoint(this.pickingPoint.x, this.pickingPoint.y));
    this.pickWorldPosition.copy(this.worldMousePosition);
    //TLCheckBoundary.getInstance().setPickingPos(this.pickingPoint.x, this.pickingPoint.y);
  } else {
    this.pickingPoint.x = ev.center.x;
    this.pickingPoint.y = ev.center.y - TLDomInfo.getInstance().getDomElement().offsetTop;
    this.baseScale = this.scale;
    this.basePosition = this.transformedPoint(this.pickingPoint.x, this.pickingPoint.y);

    this.pickTermSpace.x = this.pickingPoint.x;
    this.pickTermSpace.y = this.pickingPoint.y;
    this.worldMousePosition.copy(this.transformedPoint(this.pickingPoint.x, this.pickingPoint.y));
    this.pickWorldPosition.copy(this.worldMousePosition);
    //TLCheckBoundary.getInstance().setPickingPos(this.pickingPoint.x, this.pickingPoint.y);
  }
};
TLSVGMatrixInfoBase.prototype.pinchMove = function (ev) {
  this.scale = this.baseScale * ev.scale;
  if (this.scale < this.scaleMin) {
    this.scale = this.scaleMin;
  } else if (this.scale > this.scaleMax) {
    this.scale = Math.max(this.scaleStaticMin, Math.min(this.scaleStaticMax, this.baseScale * ev.scale));
  }


  //this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.baseScale * ev.scale));
  //this.translate(this.basePosition.x, this.basePosition.y);
  //this.setScale(this.scale, this.scale);
  //this.translate(-this.basePosition.x, -this.basePosition.y);

  this.setAffineTransform(this.scale, this.radian,
    { x: this.pickWorldPosition.x, y: this.pickWorldPosition.y },
    this.pickTermSpace);

  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
  //this.updateSquareBoundary();
  //this.updateWorldMatrix();
  //TLEventManager.getInstance().signals.updateRender.dispatch();
};
TLSVGMatrixInfoBase.prototype.pinchEnd = function (ev) {
  this.pickingPoint.set(0, 0);
  this.baseScale = this.scale;
  this.startPan = false;
};
//-----------------------------------------------
//  Desc  : zoom은 pc와 모바일을 완전 분리 한다.
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.onZoom = function (ev) {

  var delta = 0;
  if (ev.wheelDelta !== undefined) {
    // WebKit / Opera / Explorer 9
    delta = ev.wheelDelta;

  } else if (ev.detail !== undefined) {
    // Firefox
    delta = -ev.detail * 2;
  }

  //delta = delta > 0 ? 1 : -1;

  //if (scope.isWindow) {
  //  delta *= 4;
  //}

  if (new Date() - this.wheelTime > 100) {
    var lastX = ev.offsetX || (ev.pageX - this.canvas.offsetLeft);
    var lastY = ev.offsetY || (ev.pageY - this.canvas.offsetTop);

    this.baseScale = this.scale;
    this.basePosition = this.transformedPoint(lastX, lastY);

    this.pickTermSpace.x = lastX;
    this.pickTermSpace.y = lastY;
    this.pickWorldPosition.copy(this.worldMousePosition);

    if (TLG.PLAN_STATE === TLG.PLAN_SEAT &&
      TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE) {
      // 구 밖에서는 center
      var squaredLength = this.moveBoundaryCenter.distanceToSquared(this.pickWorldPosition);
      if (squaredLength - (this.moveBoundaryRadius * this.moveBoundaryRadius) >= 0) {
        this.pickWorldPosition.copy(this.worldCenterPosition);
        this.pickTermSpace.x = this.canvas.width * 0.5;
        this.pickTermSpace.y = this.canvas.height * 0.5;
      }
    }
  }


  let scaleFactor = 0.0001 * 8;
  this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.baseScale + (this.baseScale * delta * scaleFactor)));

  this.setAffineTransform(this.scale, this.radian, { x: this.pickWorldPosition.x, y: this.pickWorldPosition.y }, this.pickTermSpace);


  //this.updateSquareBoundary();
  //this.updateWorldMatrix();
  this.baseScale = this.scale;
  this.wheelTime = new Date();

  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
  //// check defaultAction ---------------------
  ////this.squareBoundary
  //if (this.scale < this.scaleMin || this.scale > this.scaleMax) {
  //  var targetScale = Math.max(this.scaleMin,
  //    Math.min(this.scaleMax, this.scale));
  //
  //  this.setDefaultAction({
  //    target: targetScale,
  //    startTime: new Date()
  //  });
  //}
  ////------------------------------------------

};

TLSVGMatrixInfoBase.prototype.uiZoom = function (delta) {
  this.baseScale = this.scale;
  this.scale = Math.max(this.scaleMin,
    Math.min(this.scaleMax, this.baseScale + delta));

  this.setAffineTransform(this.scale, this.radian,
    { x: this.worldCenterPosition.x, y: this.worldCenterPosition.y },
    { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 });//this.pickTermSpace);

  //this.updateSquareBoundary();
  //this.updateWorldMatrix();
  this.baseScale = this.scale;
  this.wheelTime = new Date();

  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
};

TLSVGMatrixInfoBase.prototype.uiAutoZoomIn = function (x, y, event) {
  if (event) { //Mobile
    var lastX = event.srcEvent.offsetX || (event.srcEvent.pageX - this.canvas.offsetLeft);
    var lastY = event.srcEvent.offsetY || (event.srcEvent.pageY - this.canvas.offsetTop);
    this.worldMousePosition.copy(this.transformedPoint(lastX, lastY));
    // console.log('transformedPoint', this.worldMousePosition);
  }
  var mousePoint = Object.assign({}, this.worldMousePosition);

  var moveBoundary = {
    x: {
      min: Math.min(this.moveScreenToWorldBoundary.LT.x, this.moveScreenToWorldBoundary.LB.x, this.moveScreenToWorldBoundary.RT.x, this.moveScreenToWorldBoundary.RB.x),
      max: Math.max(this.moveScreenToWorldBoundary.LT.x, this.moveScreenToWorldBoundary.LB.x, this.moveScreenToWorldBoundary.RT.x, this.moveScreenToWorldBoundary.RB.x)
    },
    y: {
      min: Math.min(this.moveScreenToWorldBoundary.LT.y, this.moveScreenToWorldBoundary.LB.y, this.moveScreenToWorldBoundary.RT.y, this.moveScreenToWorldBoundary.RB.y),
      max: Math.max(this.moveScreenToWorldBoundary.LT.y, this.moveScreenToWorldBoundary.LB.y, this.moveScreenToWorldBoundary.RT.y, this.moveScreenToWorldBoundary.RB.y)
    }
  };

  if (mousePoint.x < moveBoundary.x.min || moveBoundary.x.max < mousePoint.x) {
    // console.log('can\'t move X');
    return;
  }

  if (mousePoint.y < moveBoundary.y.min || moveBoundary.y.max < mousePoint.y) {
    // console.log('can\'t move Y');
    return;
  }

  var setScale = 1;
  this.uiMoveAnimation(this.worldCenterPosition, mousePoint, { x: x, y: y }, setScale);
};

/**
 * @description 애니메이션 동작 함수
 * @param current
 * @param target
 * @param origin
 * @param endScale
 */
TLSVGMatrixInfoBase.prototype.uiMoveAnimation = function (current, target, origin, endScale) {
  if (this.animationRenderFlag) {
    return;
  }
  this.animationRenderFlag = true;

  var startTime = null;
  var startScale = this.scale;
  var duration = 1000 - (startScale * 1000);
  var _this = this;

  var width = TLDomInfo.getInstance().getWidth();
  var height = TLDomInfo.getInstance().getHeight();

  function animate(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }

    var progress = easeInOutQuad(Math.min((timestamp - startTime) / duration, 1));
    var currentScale = startScale + (endScale - startScale) * progress;  // 현재 scale 계산
    var currentInstance = TLSVGMatrixInfo.getInstance();
    currentInstance.setAffineTransform(
      currentScale,
      currentInstance.radian,
      _this.positionOfCalculateClickPoint(target, origin, currentScale),
      { x: width * 0.5, y: height * 0.5 }
    );
    _this.updateScreenToWorldBox();

    TLEventManager.getInstance().signals.updateRender.dispatch();

    // 현재 좌표가 목표 좌표와 같아질 때까지 애니메이션 반복
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      _this.scale = endScale;
      _this.animationRenderFlag = false;

      if (origin) {
        _this.worldMousePosition.copy(_this.transformedPoint(origin.x, origin.y));
      }
    }
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function easeOut(t) {
    return t * (2 - t);
  }

  function easeIn(t) {
    return t * t;
  }

  requestAnimationFrame(animate);
};

/**
 * @desc 클릭한 위치를 계산하는 함수 (회전행렬 포함)
 * @param mapPositionOfClick: { x: number, y: number } 전체 맵에서 유저가 클릭한 좌표값
 * @param positionOfClickMouse: { x: number, y: number } DOM에서 유저가 클릭한 좌표값
 * @param currentScale: number
 */
TLSVGMatrixInfoBase.prototype.positionOfCalculateClickPoint = function (mapPositionOfClick, positionOfClickMouse, currentScale) {
  var width = TLDomInfo.getInstance().getWidth();
  var height = TLDomInfo.getInstance().getHeight();

  var clickPercent = {
    x: positionOfClickMouse.x / width,
    y: positionOfClickMouse.y / height
  };

  var currentMapSize = {
    x: width / currentScale,
    y: height / currentScale
  };

  var min = {
    x: mapPositionOfClick.x - (currentMapSize.x * clickPercent.x),
    y: mapPositionOfClick.y - (currentMapSize.y * clickPercent.y)
  };

  var fixedCenterPosition = {
    x: min.x + (currentMapSize.x / 2),
    y: min.y + (currentMapSize.y / 2)
  };

  const rotatedPoint = this.rotatePoint(fixedCenterPosition, mapPositionOfClick, this.radian * -1);

  return rotatedPoint;
};

/**
 * @desc 회전행렬을 수행하는 함수
 * @param centerPoint: { x: number, y: number }
 * @param rotatePoint: { x: number, y: number }
 * @param radian: number
 */
TLSVGMatrixInfoBase.prototype.rotatePoint = function (rotatePoint, centerPoint, radian) {
  var fixedRadian = radian;
  var prime = {
    x: rotatePoint.x - centerPoint.x,
    y: rotatePoint.y - centerPoint.y
  };
  var doublePrime = {
    x: prime.x * Math.cos(fixedRadian) - prime.y * Math.sin(fixedRadian),
    y: prime.x * Math.sin(fixedRadian) + prime.y * Math.cos(fixedRadian)
  };
  return {
    x: doublePrime.x + centerPoint.x,
    y: doublePrime.y + centerPoint.y
  };
};

//-----------------------------------------------
//  Desc  : rotate는 pc와 모바일을 완전 분리 한다.
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.onRotate = function (ev) {
  var delta = 0;
  if (ev.wheelDelta !== undefined) {
    // WebKit / Opera / Explorer 9
    delta = ev.wheelDelta;

  } else if (ev.detail !== undefined) {
    // Firefox
    delta = -ev.detail * 2;
  }


  delta = delta > 0 ? 1 : -1;

  //if (scope.isWindow) {
  //  delta *= 4;
  //}

  if (new Date() - this.wheelTime > 100) {
    var lastX = ev.offsetX || (ev.pageX - this.canvas.offsetLeft);
    var lastY = ev.offsetY || (ev.pageY - this.canvas.offsetTop);
    this.basePosition = this.transformedPoint(lastX, lastY);
    this.pickTermSpace.x = lastX;
    this.pickTermSpace.y = lastY;
    this.pickWorldPosition.copy(this.worldMousePosition);
  }

  this.radian += Math.PI / 18 * delta;

  //this.translate(this.basePosition.x, this.basePosition.y);
  //this.rotate(this.radian);
  ////this.setRotation(this.radian);
  //this.translate(-this.basePosition.x, -this.basePosition.y);
  //// 회전시 SVG Matrix로 처리.
  //this.svgMatrix = TLDomInfo.getInstance().context.currentTransform;


  //this.setAffineTransform(this.scale, this.radian, {x: -1042, y: -1000}, this.pickTermSpace);
  this.setAffineTransform(this.scale, this.radian,
    { x: this.pickWorldPosition.x, y: this.pickWorldPosition.y },
    this.pickTermSpace);

  //this.updateSquareBoundary();
  //this.updateWorldMatrix();
  this.baseScale = this.scale;
  this.wheelTime = new Date();
};

/////////////////////////////////////////////////////////////////////////////////////////////

//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.getMatrix = function () {
  return this.svgMatrix;
};
////----------------------------------------------------
////  Desc : 아래 주석은 퍼포먼스 저하의 원인이다.
////         도면에서 save/restore 는 쓰지 않는 것으로 한다.
////----------------------------------------------------
//TLSVGMatrixInfoBase.prototype.save = function () {
//  this.savedTransforms.push(this.svgMatrix.translate(0, 0));
//  return TLDomInfo.getInstance().context.save();
//};
//
//TLSVGMatrixInfoBase.prototype.restore = function () {
//  this.svgMatrix = this.savedTransforms.pop();
//  return TLDomInfo.getInstance().context.restore();
//};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.setScale = function (sx, sy) {
  this.svgMatrix.a = Math.cos(this.radian) * sx;
  this.svgMatrix.b = Math.sin(this.radian) * sy;
  this.svgMatrix.c = -Math.sin(this.radian) * sx;
  this.svgMatrix.d = Math.cos(this.radian) * sy;

  //this.svgMatrixScale.a = Math.cos(this.radian) * sx;
  //this.svgMatrixScale.b = Math.sin(this.radian) * sy;
  //this.svgMatrixScale.c = -Math.sin(this.radian) * sx;
  //this.svgMatrixScale.d = Math.cos(this.radian) * sy;
  //this.svgMatrix = this.svgMatrixScale.multiply(this.svgMatrix);

  this.context.setTransform(
    this.svgMatrix.a, this.svgMatrix.b, this.svgMatrix.c,
    this.svgMatrix.d, this.svgMatrix.e, this.svgMatrix.f);
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.rotate = function (radians) {
  //this.svgMatrix = this.svgMatrix.rotate(radians * 180 / Math.PI);
  //return TLDomInfo.getInstance().context.rotate(radians);
  this.svgMatrix = this.svgMatrix.rotate(radians);

  //this.radian = radians;
  //this.svgMatrix.a *= this.scale;
  //this.svgMatrix.d *= this.scale;
  return this.context.rotate(radians);
};

TLSVGMatrixInfoBase.prototype.setRotation = function (radians) {
  var radian = Math.PI * 0.4;
  this.svgMatrix.a = Math.cos(radians) * this.scale;
  this.svgMatrix.b = Math.sin(radians) * this.scale;
  this.svgMatrix.c = -Math.sin(radians) * this.scale;
  this.svgMatrix.d = Math.cos(radians) * this.scale;
  //this.svgMatrix.e *= 1;
  //this.svgMatrix.f *= 1;
  return this.context.setTransform(
    this.svgMatrix.a,
    this.svgMatrix.b,
    this.svgMatrix.c,
    this.svgMatrix.d,
    this.svgMatrix.e,
    this.svgMatrix.f);
};

TLSVGMatrixInfoBase.prototype.setCheckMatrix = function (matrix) {
  this.checkSvgMatrix.a = matrix.a;
  this.checkSvgMatrix.b = matrix.b;
  this.checkSvgMatrix.c = matrix.c;
  this.checkSvgMatrix.d = matrix.d;
  this.checkSvgMatrix.e = matrix.e;
  this.checkSvgMatrix.f = matrix.f;
  return this.checkSvgMatrix;
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.translate = function (dx, dy) {
  this.svgMatrix = this.svgMatrix.translate(dx, dy);
  return this.context.translate(dx, dy);
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.transform = function (a, b, c, d, e, f) {
  var m2 = this.svg.createSVGMatrix();
  m2.a = a;
  m2.b = b;
  m2.c = c;
  m2.d = d;
  m2.e = e;
  m2.f = f;
  this.svgMatrix = this.svgMatrix.multiply(m2);
  return this.context.transform(a, b, c, d, e, f);
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.setTransform = function (a, b, c, d, e, f) {
  this.svgMatrix.a = a;
  this.svgMatrix.b = b;
  this.svgMatrix.c = c;
  this.svgMatrix.d = d;
  this.svgMatrix.e = e;
  this.svgMatrix.f = f;
  return this.context.setTransform(a, b, c, d, e, f);
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
//TLSVGMatrixInfoBase.prototype.setWarp = function (x, y) {
TLSVGMatrixInfoBase.prototype.setKeepPosition = function (x, y) {
  this.svgMatrix.e = x;
  this.svgMatrix.f = y;
  return this.context.setTransform(
    this.svgMatrix.a,
    this.svgMatrix.b,
    this.svgMatrix.c,
    this.svgMatrix.d,
    this.svgMatrix.e,
    this.svgMatrix.f);
};

TLSVGMatrixInfoBase.prototype.setWarpWorld = function (eventType, x, y) {
  var vPosition = {
    x: x,
    y: y
  };
  var vPivot = {
    x: 0,
    y: 0
  };
  var domWidth = TLDomInfo.getInstance().getWidth();
  var domHeight = TLDomInfo.getInstance().getHeight();

  if (eventType === 'NORMAL') {
    vPivot.x = domWidth * 0.5;
    vPivot.y = domHeight * 0.5;
  } else if (eventType === 'BACK') {
    vPosition.x = this.savedX;
    vPosition.y = this.savedY;
  }

  this.setAffineTransform(this.scale, this.radian, vPosition, vPivot);
  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
  this.updateScreenToWorldBox();
};

TLSVGMatrixInfoBase.prototype.setWarpSectionWorld = function (vPos, vNormal) {
  var domWidth = TLDomInfo.getInstance().getWidth();
  var domHeight = TLDomInfo.getInstance().getHeight();
  var vPivot = {
    x: domWidth,
    y: domHeight
  };

  if (!tk.utils.isWaitingReservation()
    && tk.state.device.isMobile()
    && tk.state.view.isMobileSeatLayerOpen // Mobile이고 Tab이 열려있다면
  ) { // 모바일 등급 tab 여부에 따른 resizing
    var tabInfo = TLMobileDomInfo.getInstance().domElement;
    if (tabInfo.clientHeight) {
      vPivot.x = domWidth * 0.5;
      vPivot.y = (domHeight - tabInfo.clientHeight) * 0.5;
    }
  } else {
    vPivot.x = domWidth * 0.5;
    vPivot.y = domHeight * 0.5;
  }

  this.radian = TLG.getNormal2Radian(vNormal);
  this.setAffineTransform(this.scale, this.radian, vPos, vPivot);

  this.worldCenterPosition.copy(this.transformedPoint(
    this.canvas.width * 0.5,
    this.canvas.height * 0.5));
  this.worldScreenRadius = this.worldCenterPosition.distanceTo(this.transformedPoint(0, 0));
  this.updateScreenToWorldBox();
};
//-----------------------------------------------
//  Desc  :
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.transformedPoint = function (x, y) {
  if (this.svgMatrix.a === 0 || this.svgMatrix.d === 0) {
    return new Vector2();
  }
  this.pt.x = x;
  this.pt.y = y;

  var vResult = this.pt.matrixTransform(this.svgMatrix.inverse());
  return new Vector2(vResult.x, vResult.y);
};

//-----------------------------------------------
//  Desc  : 스크린 박스를 실제 월드좌표에 대응 되게 변환.
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.updateScreenToWorldBox = function () {

  var domInfo = TLDomInfo.getInstance();
  this.screenToWorldBox.LT = this.transformedPoint(0, 0);
  this.screenToWorldBox.LB = this.transformedPoint(0, domInfo.getHeight());
  this.screenToWorldBox.RT = this.transformedPoint(domInfo.getWidth(), 0);
  this.screenToWorldBox.RB = this.transformedPoint(domInfo.getWidth(), domInfo.getHeight());

  return this.screenToWorldBox;
};

//-----------------------------------------------
//  Desc  : 선형 보간 관련. (추후 구면 선형보간[sLerp] 추가.)
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.lerpScale = function (ori, dest, t) {
  var result = ori + t * (dest - ori);
  return result;
};

TLSVGMatrixInfoBase.prototype.lerpVector2 = function (vOri, vDest, t) {
  //vOri + t*(vDest-vOri)
  var vResult = new Vector2(0, 0);
  vResult.x = vOri.x + t * (vDest.x - vOri.x);
  vResult.y = vOri.y + t * (vDest.y - vOri.y);
  return vResult;
};

//-----------------------------------------------
//  Desc  : 구와 AABB 간의 충돌 처리.
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.collisionBoundaryCheck = function () {

};

//-----------------------------------------------
//  Desc  : 연산에 필요한 좌표들을 계산한다.
//-----------------------------------------------
TLSVGMatrixInfoBase.prototype.updateWorldMatrix = function () {
  ////var scale = this.scale = this.getMatrix().a;
  //var scale = this.getMatrix().a;
  //var termSpace = 5;
  //// 가장 기준점.
  //this.screenBox.min.x = (-this.getMatrix().e + termSpace) / scale;
  //this.screenBox.min.y = (-this.getMatrix().f + termSpace) / scale;
  //this.screenBox.max.x = this.screenBox.min.x +
  //    (TLDomInfo.getInstance().getWidth() - termSpace * 2) / scale;
  //this.screenBox.max.y = this.screenBox.min.y +
  //    (TLDomInfo.getInstance().getHeight() - termSpace * 2) / scale;
  //
  //termSpace = 150;
  //// 컬링 box 체크
  //this.cullingBox.min.x = (-this.getMatrix().e + termSpace) / scale;
  //this.cullingBox.min.y = (-this.getMatrix().f + termSpace) / scale;
  //this.cullingBox.max.x = this.cullingBox.min.x +
  //    (TLDomInfo.getInstance().getWidth() - termSpace * 2) / scale;
  //this.cullingBox.max.y = this.cullingBox.min.y +
  //    (TLDomInfo.getInstance().getHeight() - termSpace * 2) / scale;
  //
  //termSpace = 0;
  //// 컬링 box 체크
  //this.screenBoundary.setFromCenterAndSize(this.screenBox.getCenter(),
  //    new Vector2(this.mapSize, this.mapSize));
  //
  //// screenBoundary 를 스크린 사이즈에 맞춘다.( 화면보다 클경우 )
  //if (Math.min(this.screenBoundary.getSize().x, this.screenBoundary.getSize().y)
  //    > Math.min(this.screenBox.getSize().x, this.screenBox.getSize().y)) {
  //    this.screenBoundary.copy(this.screenBox);
  //}
  //
  //this.screenBoundaryArray[0].x = this.screenBoundary.min.x;  // LT
  //this.screenBoundaryArray[0].y = this.screenBoundary.min.y;
  //this.screenBoundaryArray[1].x = this.screenBoundary.min.x;  // LB
  //this.screenBoundaryArray[1].y = this.screenBoundary.max.y;
  //this.screenBoundaryArray[2].x = this.screenBoundary.max.x;  // RT
  //this.screenBoundaryArray[2].y = this.screenBoundary.min.y;
  //this.screenBoundaryArray[3].x = this.screenBoundary.max.x;  // RB
  //this.screenBoundaryArray[3].y = this.screenBoundary.max.y;
};

TLSVGMatrixInfoBase.prototype.setAffineTransform = function (scale, radian, vPosition, vPivot) {

  //this.scale = scale;
  //this.radian = radian;
  //this.position = vPosition;

  this.svgMatrixScale.a = scale;
  this.svgMatrixScale.d = scale;

  this.svgMatrixRotate.a = Math.cos(radian);
  this.svgMatrixRotate.b = Math.sin(radian);
  this.svgMatrixRotate.c = -Math.sin(radian);
  this.svgMatrixRotate.d = Math.cos(radian);

  this.svgMatrix = this.svgMatrixScale.multiply(this.svgMatrixRotate);

  this.svgMatrixTransrate.e = -vPosition.x;
  this.svgMatrixTransrate.f = -vPosition.y;

  // 시행착오를 격지 않도록 해당부분 주석으로 처리 ------------------------------------------------------------
  //this.svgMatrixTransrate.e = -vPosition.x + vPivot.x / scale;
  //this.svgMatrixTransrate.f = -vPosition.y + vPivot.y / scale;

  //this.svgMatrixTransrate.e = vPosition.x + (vPosition.x * Math.cos(radian) + vPosition.y * Math.sin(radian));
  //this.svgMatrixTransrate.f = vPosition.y + (vPosition.x * Math.sin(radian) - vPosition.y * Math.cos(radian));

  //var termX = -(-vPivot.x * Math.cos(radian) + vPivot.y * Math.sin(radian) ) / scale;
  //var termY = -(-vPivot.x * Math.sin(radian) - vPivot.y * Math.cos(radian) ) / scale;
  //console.log("vPivot : %d, %d", vPivot.x/scale, vPivot.y/scale)
  //console.log("term : %d, %d", termX, termY)
  //this.svgMatrixTransrate.e = -vPosition.x + termX;
  //this.svgMatrixTransrate.f = -vPosition.y + termY;
  //-------------------------------------------------------------------------------------------------

  this.svgMatrix = this.svgMatrix.multiply(this.svgMatrixTransrate);

  // 결국 pivot은 스크린 이동.
  this.svgMatrix.e += vPivot.x;
  this.svgMatrix.f += vPivot.y;

  return this.context.setTransform(
    this.svgMatrix.a,
    this.svgMatrix.b,
    this.svgMatrix.c,
    this.svgMatrix.d,
    this.svgMatrix.e,
    this.svgMatrix.f);
};

//-------------------------------------------------------
//  Desc  : 화면에 꽉차게 만들고 센터정렬한다.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.fullScreenSizeMap = function () {
  if (TLG.EXPOSURE_BLOCK_SCALE !== undefined) {
    this.scaleMin = this.screenMinSize / this.mapSize;
    this.scale = TLG.EXPOSURE_BLOCK_SCALE * this.scaleMin;

    if (this.scale >= this.scaleMin) {
      this.scaleStaticMin = this.scaleMin * 0.5;
    } else {
      this.scaleStaticMin = this.scale * 0.5;
      this.scaleMin = this.scale;
    }

  } else {
    this.screenMinSize = TLDomInfo.getInstance().getWidth();
    this.scaleMin = this.screenMinSize / this.mapSize;
    this.scale = this.scaleMin;
    this.scaleStaticMin = this.scaleMin * 0.5;
    var vCenter = new Vector2(
      TLDomInfo.getInstance().getWidth() * 0.5,
      TLDomInfo.getInstance().getHeight() * 0.5);
    this.setAffineTransform(this.scale, 0.0, new Vector2(this.mapSize * 0.5, this.mapSize * 0.5), vCenter);
  }
};

//-------------------------------------------------------
//  Desc  : 화면에 꽉차게 만들고 센터정렬한다.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.fullScreenSizeMapByBack = function () {
  if (TLG.EXPOSURE_BLOCK_SCALE !== undefined) {
    this.scaleMin = this.screenMinSize / this.mapSize;
    var tempScale = TLG.EXPOSURE_BLOCK_SCALE * this.scaleMin;

    if (tempScale >= this.scaleMin) {
      this.scaleStaticMin = this.scaleMin * 0.5;
    } else {
      this.scaleStaticMin = tempScale * 0.5;
      this.scaleMin = tempScale;
    }
  }
};

//-------------------------------------------------------
//  Desc  : 경계사각형을 update한다.(각 부분의 min/max 값 재조정)
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.updateSquareBoundary = function () {
  this.screenMinSize = TLDomInfo.getInstance().getWidth();
  //scale 의 min 값 도출.
  //this.screenMinSize = Math.min(TLDomInfo.getInstance().getWidth(),
  //    TLDomInfo.getInstance().getHeight());

  if (TLG.PLAN_STATE === TLG.PLAN_AREA) {
    return;
  }
  // 화면보다 mapSize 가 작을 경우 scaleMin의 범위는 0.5 ~ 1.0 사이.

  if (tk.state.plan.physicalPlan.blockPhysicalPlan && TLDomInfo.getInstance().canvas.style.display === 'block') {
    this.scaleMin = Math.max(0.5, Math.min(1.0, this.screenMinSize / this.mapSize));
  } else {
    if (TLG.EXPOSURE_BLOCK_SCALE !== undefined) {
      this.scaleMin = this.screenMinSize / this.mapSize;
      var scale = TLG.EXPOSURE_BLOCK_SCALE * this.scaleMin;

      if (scale < this.scaleMin) {
        this.scaleMin = scale;
      }
    } else {
      this.screenMinSize = TLDomInfo.getInstance().getWidth();
      if (this.scale < this.screenMinSize / this.mapSize) {
        this.scaleMin = this.scale;
      } else {
        this.scaleMin = this.screenMinSize / this.mapSize;
      }
    }
  }
};

TLSVGMatrixInfoBase.prototype.setMapSize = function (eventType, mapSize) {
  var termSize = 0;
  this.mapSize = mapSize;
  this.mapBoundary.min.x = this.mapBoundary.min.y = -termSize;
  this.mapBoundary.max.x = this.mapBoundary.max.y = this.mapSize + termSize;
  this.updateWorldMatrix();
  if (eventType === 'NORMAL') {
    this.scale = TLG.EXPOSURE_SCALE;
  }
  this.updateSquareBoundary();
};

//----------------------------------------------
//  Desc : map size 안에 포인트가 유무.
//----------------------------------------------
TLSVGMatrixInfoBase.prototype.isContainsPointInMap = function (mapSize, point) {
  return point.x < 0 || point.x > mapSize ||
  point.y < 0 || point.y > mapSize ? false : true;
};


//-------------------------------------------------------
//  Desc  : 페이징 감지.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.pagingSectorDetection = function () {
  var TLG_BG_TYPE = TLG.BACKGROUND_TYPE;
  if (TLG.PLAN_STATE === TLG.PLAN_AREA) {
    return;
  }

  let canUpdate = true;

  if (TLG_BG_TYPE === TLG.BG_SECTION_TILE ||
    TLG_BG_TYPE === TLG.BG_EXTENTION_SECTION_TILE) {
    if (tk.state.select.selectedBlock === null) {
      return;
    }

    var blockId = tk.state.select.selectedBlock.blockId;
    if (tk.state.plan.blockCallMap[blockId]) {
      return;
    }
    tk.state.plan.blockCallMap[blockId] = true;

    try {
      canUpdate = tk.controller.data.checkProcessAndUpdate();
    } catch (e) {
      console.log('checkProcessAndUpdate Error', e);
    }

    if (canUpdate) {
      tk.event.service.signals.updateReservationSeatDataBySector.dispatch(blockId);
    }
  } else {
    var pagingArray = this.getPagingArray(true);
    if (pagingArray.length === 0) {
      return;
    }

    try {
      canUpdate = tk.controller.data.checkProcessAndUpdate();
    } catch (e) {
      console.log('checkProcessAndUpdate Error', e);
    }

    if (canUpdate) {
      tk.event.service.signals.updateReservationSeatDataByAreaWithKey.dispatch(pagingArray);
    }
  }
};

//-------------------------------------------------------
//  Desc  : get paging data
//  Param :
//    isMapSetting : Map에 설정 여부
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.getPagingArray = function (isMapSetting) {
  var pagingArray = [];
  for (var key in tk.state.plan.pagingCallMap) {
    if (isMapSetting) {
      if (tk.state.plan.pagingCallMap[key]) {
        continue;
      }
    }

    var rowColArray = key.split(':', 2);
    var x = parseInt(rowColArray[0]) * TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_SIZE * 0.5;
    var y = parseInt(rowColArray[1]) * TLG.LOGICAL_TILE_SIZE + TLG.LOGICAL_TILE_SIZE * 0.5;
    var sumRadiusSquared = (this.worldScreenRadius + TLG.LOGICAL_TILE_RADIUS);
    sumRadiusSquared *= sumRadiusSquared;
    var squaredLength = this.worldCenterPosition.distanceToSquared({ x: x, y: y });
    if (squaredLength < sumRadiusSquared) {
      if (isMapSetting) {
        tk.state.plan.pagingCallMap[key] = true;
      }
      pagingArray.push(key);
    }
  }
  return pagingArray;
};


//-------------------------------------------------------
//  Desc  : 영역 감지.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.selectAreaDetection = function (scale, ev) {
  // [예매대기전용] 구역형일때 선택 불가능하게 prefix
  // if (tk.utils.isWaitingReservation()) {
  // 	if (tk.state.waitingDetail.useGradeSelect) {
  // 		// return;
  // 	}
  // }

  if (ev != undefined) {
    // 모바일 일때.
    this.worldMousePosition = this.transformedPoint(ev.center.x,
      ev.center.y - TLDomInfo.getInstance().getDomElement().offsetTop);
  }
  var blocks = tk.state.plan.blockInfo;
  // 영역 겹침 처리를 위해서 역순으로 확인
  // 나중에 생긴 영역의 Id 값이 먼저 생긴 영역의 Id 보다 작다.
  for (var blockIdx = blocks.length - 1; blockIdx > -1; blockIdx--) {
    var blockObj = blocks[blockIdx];
    // 맵영역 안쪽 영역 오브젝트만 체킹한다.------------------
    if (!this.isContainsPointInMap(this.mapSize,
      {
        x: blockObj.linkedPoint.x * scale,
        y: blockObj.linkedPoint.y * scale
      })) {
      continue;
    }
    //-------------------------------------------

    if (TLG.ptInPolygon(blockObj.cornerPoints, {
      x: this.worldMousePosition.x / scale,
      y: this.worldMousePosition.y / scale
    })) {
      return blockObj;
    }
  }

  return null;
};

//-------------------------------------------------------
//  Desc  : 좌석 감지.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.selectSeatDetection = function (ev) {
  if (ev != undefined) {
    // 모바일 일때.
    this.worldMousePosition = this.transformedPoint(ev.center.x,
      ev.center.y - TLDomInfo.getInstance().getDomElement().offsetTop);
  }

  var row = parseInt(this.worldMousePosition.x / TLG.LOGICAL_TILE_SIZE);
  var col = parseInt(this.worldMousePosition.y / TLG.LOGICAL_TILE_SIZE);
  var key = row + ':' + col;

  var pagingMap = (TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE ||
  (TLG.BACKGROUND_TYPE === TLG.BG_EXTENTION_SECTION_TILE) ?
    tk.state.plan.blockSectorMap[tk.state.select.selectedBlock.blockId] : tk.state.plan.pagingMap);

  var seatArray = pagingMap[key];
  if (seatArray === undefined) {
    return;
  }
  for (var i = seatArray.length - 1; i >= 0; i--) {
    var seatInfo = seatArray[i];
    if (tk.state.plan.seatSoldMap[seatInfo.logicalSeatId]) {
      continue;
    }
    var squaredLength = this.worldMousePosition.distanceToSquared(seatInfo.position);
    if (squaredLength < TLG.LOGICAL_SEAT_RADIUS_SQUARED) {
      return seatInfo;
    }
  }


  //------------------------------------------------
  for (var otherRow = row - 1; otherRow < row + 2; otherRow++) {
    for (var otherCol = col - 1; otherCol < col + 2; otherCol++) {
      if (otherRow === row && otherCol == col) {
        continue;
      }
      key = otherRow + ':' + otherCol;
      seatArray = pagingMap[key];
      if (seatArray === undefined) {
        continue;
      }
      for (var i = seatArray.length - 1; i >= 0; i--) {
        var seatInfo = seatArray[i];
        if (tk.state.plan.seatSoldMap[seatInfo.logicalSeatId]) {
          continue;
        }
        var squaredLength = this.worldMousePosition.distanceToSquared(seatInfo.position);
        if (squaredLength < TLG.LOGICAL_SEAT_RADIUS_SQUARED) {
          return seatInfo;
        }
      }
    }
  }
  //------------------------------------------------
  return null;
};
//-------------------------------------------------------
//  Desc  : 비지정석 감지.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.selectZoneDetection = function (ev) {
  if (ev != undefined) {
    // 모바일 일때.
    this.worldMousePosition = this.transformedPoint(ev.center.x,
      ev.center.y - TLDomInfo.getInstance().getDomElement().offsetTop);
  }

  //부분노출 + 선택한 영역 + 선택한 등급 있는 경우 비지정 감지하지 않음
  if ((TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE || TLG.BACKGROUND_TYPE === TLG.BG_EXTENTION_SECTION_TILE)
    && tk.state.select.selectedBlock
    && tk.state.select.selectedGrade) {
    return;
  }

  var zones = tk.state.plan.zoneInfo;
  // 비지정석 겹침 처리를 위해서 역순으로 확인
  // 나중에 생긴 비지정석의 Id 값이 먼저 생긴 비지정석의 Id 보다 작다.
  for (var zoneIdx = zones.length - 1; zoneIdx > -1; zoneIdx--) {
    var zoneInfo = zones[zoneIdx];
    // 맵영역 안쪽 비지정 오브젝트만 체킹한다.------------------
    if (!this.isContainsPointInMap(this.mapSize,
      {
        x: zoneInfo.cornerPoints[0].x,
        y: zoneInfo.cornerPoints[0].y
      })) {
      continue;
    }
    //------------------------------------------------

    // 남은 비지정석 매수가 0매인 경우에도 툴팁 노출은 필요
    if (tk.state.plan.zoneSoldMap[zoneInfo.logicalZoneId] < 0) {
      continue;
    }
    if (TLG.ptInPolygon(zoneInfo.cornerPoints, this.worldMousePosition)) {
      return zoneInfo;
    }
  }
  return null;
};


//-------------------------------------------------------
//  Desc  : 이동가능한 바운더리 Setting
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.setMoveS2W_Boundary = function (boundary) {
  this.moveScreenToWorldBoundary = {
    LT: new Vector2(),
    LB: new Vector2(),
    RT: new Vector2(),
    RB: new Vector2()
  };

  this.moveScreenToWorldBoundary.LT.copy(boundary.LT);
  this.moveScreenToWorldBoundary.LB.copy(boundary.LB);
  this.moveScreenToWorldBoundary.RT.copy(boundary.RT);
  this.moveScreenToWorldBoundary.RB.copy(boundary.RB);
};

TLSVGMatrixInfoBase.prototype.setMoveBoundary = function (cornerPoints) {
  this.outAccelerValue = -1.0;
  if (cornerPoints === undefined) {
    this.moveBoundary.min = new Vector2(0, 0);
    this.moveBoundary.max = new Vector2(this.mapSize, this.mapSize);
    //this.moveBoundaryRadius = this.moveBoundary.getCenter().distanceTo(this.moveBoundary.min);
    this.moveBoundaryRadius = this.mapSize * 0.5;
    this.moveBoundaryCenter.copy(this.moveBoundary.getCenter());
    return;
  }

  var length = cornerPoints.length;
  if (!length) {
    return;
  }
  this.moveBoundary.min.x = cornerPoints[0].x;
  this.moveBoundary.min.y = cornerPoints[0].y;
  this.moveBoundary.max.x = cornerPoints[0].x;
  this.moveBoundary.max.y = cornerPoints[0].y;
  for (var idx = 0; idx < cornerPoints.length; idx++) {
    var point = cornerPoints[idx];
    this.moveBoundary.min.x = Math.min(this.moveBoundary.min.x, point.x);
    this.moveBoundary.min.y = Math.min(this.moveBoundary.min.y, point.y);
    this.moveBoundary.max.x = Math.max(this.moveBoundary.max.x, point.x);
    this.moveBoundary.max.y = Math.max(this.moveBoundary.max.y, point.y);
  }
  // radius 도출.
  this.moveBoundaryRadius = 1.0;
  for (var idx = 0; idx < cornerPoints.length; idx++) {
    var point = cornerPoints[idx];
    this.moveBoundaryRadius = Math.max(this.moveBoundaryRadius,
      this.moveBoundary.getCenter().distanceTo(new Vector2(point.x, point.y)));
  }
  //this.moveBoundaryRadius *= 1.2;
  this.moveBoundaryCenter.copy(this.moveBoundary.getCenter());
};
//-------------------------------------------------------
//  Desc  : 이동가능한 바운더리 감지.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.updateMoveBoundary = function (x, y) {
  //console.log("%x, %y", x, y);
  var squaredLength = this.moveBoundaryCenter.distanceToSquared(this.worldCenterPosition);
  this.outAccelerValue = squaredLength - (this.moveBoundaryRadius * this.moveBoundaryRadius);
  if (this.outAccelerValue >= 0) {
    return false;
  }
  if (TLG.PLAN_STATE === TLG.PLAN_SEAT && TLG.BACKGROUND_TYPE === TLG.BG_SECTION_TILE) {
    this.oldWorldCenterPosition.copy(this.worldCenterPosition);
    this.moveVector.set(x, y);
    this.sectionWorldMatrix.e = x;
    this.sectionWorldMatrix.f = y;
  } else {
    this.oldWorldCenterPosition.copy(this.worldCenterPosition);
  }

  return true;
};

//-------------------------------------------------------
//  Desc  : 화면에 꽉차게 만들고 센터정렬한다.
//-------------------------------------------------------
TLSVGMatrixInfoBase.prototype.saveScaleAndPosition = function () {
  var pt = this.transformedPoint(this.canvas.offsetLeft, this.canvas.offsetTop);
  this.savedX = pt.x;
  this.savedY = pt.y;
  this.savedScale = this.scale;

  TLDomInfo.getInstance()
    .getDomElement()
    .dispatchEvent(
      new MouseEvent('mousemove', {
        view: window,
        bubbles: false,
        cancelable: true,
        clientX: this.savedX,
        clientY: this.savedY
      })
    );
};

TLSVGMatrixInfoBase.prototype.resetViewSize = function () {
  var center = TLSeatBackgroundLayer.getInstance().center;
  this.worldCenterPosition.copy(center);

  this.scale = TLG.EXPOSURE_SCALE;
  this.setAffineTransform(this.scale, this.radian, this.worldCenterPosition, { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 });

  TLEventManager.getInstance().signals.updateRender.dispatch();
  this.updateScreenToWorldBox();
};

var TLSVGMatrixInfo = Singletonify(TLSVGMatrixInfoBase);


//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
			(factory((global.TLG = global.TLG || {})));
}(this, (function (exports) {
	'use strict';

	var isMobile = false;
	var isDebug = false;
	var isRotateControl = false;

	//좌석 이미지 생성관련.
	var LOGICAL_SEAT_RADIUS = 8;
	var LOGICAL_SEAT_RADIUS_SQUARED = LOGICAL_SEAT_RADIUS * LOGICAL_SEAT_RADIUS;
	var LOGICAL_SINGLE_MAP_SIZE = 2048; // 싱글맵 최대사이즈.
	var LOGICAL_TILE_SIZE = 256;
	var LOGICAL_TILE_INTERSECT_SPACE = 10;
	var LOGICAL_TILE_RADIUS = 182;

	// 도면 상태
	var PLAN_SEAT = 0;
	var PLAN_AREA = 1;
	var PLAN_STATE = PLAN_SEAT;
	// 백그라운드 타입
	var BG_SINGLE = 0;
	var BG_TILE = 1;
	var BG_SECTION_TILE = 2;
	var BG_EXTENTION_SECTION_TILE = 3;
	var BACKGROUND_TYPE = BG_SINGLE;

	// 노출 스케일
	var EXPOSURE_SCALE = 1.0;
	var EXPOSURE_SCALE_MIN = 1;
	var EXPOSURE_SCALE_MAX = 300;

	// 이미지 로드 재시도
	var COUNT_IMAGE_LOAD_AREA = 0;
	var COUNT_IMAGE_LOAD_SINGLE = 0;
	var COUNT_IMAGE_LOAD_MINI = 0;
	var COUNT_IMAGE_LOAD_LV0 = 0;
	var COUNT_IMAGE_LOAD_LV4 = {};
	for (var row = 0; row < 16; row++) {
		for (var col = 0; col < 16; col++) {
			var key = row.toString() + ':' + col.toString();
			COUNT_IMAGE_LOAD_LV4[key] = 0;
		}
	}

	//----------------------------------------------------
	//  Desc : Jordan curve theorem
	//----------------------------------------------------
	var ptInPolygon = function (cornerArray, point) {
		var polygonCorners = cornerArray.length;
		var j = polygonCorners - 1;
		var oddNodes = false;

		for (var i = 0; i < polygonCorners; i++) {
			if ((cornerArray[i].y < point.y && cornerArray[j].y >= point.y
				|| cornerArray[j].y < point.y && cornerArray[i].y >= point.y)
				&& (cornerArray[i].x <= point.x || cornerArray[j].x <= point.x)) {
				if (cornerArray[i].x + (point.y - cornerArray[i].y) /
					(cornerArray[j].y - cornerArray[i].y) *
					(cornerArray[j].x - cornerArray[i].x) < point.x) {
					oddNodes = !oddNodes;
				}
			}
			j = i;
		}
		return oddNodes;
	};

	//--------------------------------------------------------
	//  Desc : 노멀 벡터에서 회전각을 리턴한다.
	//         중심점이 원점이라 가정하고 회전각을 리턴한다.
	// --------------------------------------------------------
	var getNormal2Radian = function (normal) {

		var normalVector = {x: normal.x, y: normal.y};
		//노멀벡터 검증은 패스
		//var normalVector = new THREE.Vector2(normal.x, normal.y);
		//normalVector.normalize();
		//normalVector.x = normalVector.x.toFixed(4);
		//normalVector.y = normalVector.y.toFixed(4);

		var zeroPoint = {x: 0, y: 0};
		var dx = normalVector.x - zeroPoint.x;
		var dy = normalVector.y - zeroPoint.y;

		var startRadian = Math.PI * 0.5; // 90도 기준
		var radian = Math.atan2(dy, dx) - startRadian;
		//var degree = radian*180/Math.PI ;
		//console.log("degree : %f", degree);

		// 라디안은 절대 건드리지 않는다 만약 건드린다면 노멀벡터가 변형된다.
		// 아래처럼 사용하면 X
		// radian = radian.toFixed(4);

		return radian;
	};

	exports.isMobile = isMobile;
	exports.isDebug = isDebug;
	exports.isRotateControl = isRotateControl;

	exports.LOGICAL_SEAT_RADIUS = LOGICAL_SEAT_RADIUS;
	exports.LOGICAL_SEAT_RADIUS_SQUARED = LOGICAL_SEAT_RADIUS_SQUARED;
	exports.LOGICAL_SINGLE_MAP_SIZE = LOGICAL_SINGLE_MAP_SIZE;
	exports.LOGICAL_TILE_SIZE = LOGICAL_TILE_SIZE;
	exports.LOGICAL_TILE_INTERSECT_SPACE = LOGICAL_TILE_INTERSECT_SPACE;
	exports.LOGICAL_TILE_RADIUS = LOGICAL_TILE_RADIUS;

	exports.PLAN_SEAT = PLAN_SEAT;
	exports.PLAN_AREA = PLAN_AREA;
	exports.PLAN_STATE = PLAN_STATE;
	exports.BG_SINGLE = BG_SINGLE;
	exports.BG_TILE = BG_TILE;
	exports.BG_SECTION_TILE = BG_SECTION_TILE;
	exports.BG_EXTENTION_SECTION_TILE = BG_EXTENTION_SECTION_TILE;
	exports.BACKGROUND_TYPE = BACKGROUND_TYPE;
	exports.EXPOSURE_SCALE = EXPOSURE_SCALE;
	exports.EXPOSURE_SCALE_MIN = EXPOSURE_SCALE_MIN;
	exports.EXPOSURE_SCALE_MAX = EXPOSURE_SCALE_MAX;
	exports.COUNT_IMAGE_LOAD_AREA = COUNT_IMAGE_LOAD_AREA;
	exports.COUNT_IMAGE_LOAD_SINGLE = COUNT_IMAGE_LOAD_SINGLE;
	exports.COUNT_IMAGE_LOAD_MINI = COUNT_IMAGE_LOAD_MINI;
	exports.COUNT_IMAGE_LOAD_LV0 = COUNT_IMAGE_LOAD_LV0;
	exports.COUNT_IMAGE_LOAD_LV4 = COUNT_IMAGE_LOAD_LV4;
	exports.ptInPolygon = ptInPolygon;
	exports.getNormal2Radian = getNormal2Radian;

	Object.defineProperty(exports, '__esModule', {value: true});

})));

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var mainViewer = function () {
  var eventManager = TLEventManager.getInstance();
  // var domInfo = TLDomInfo.getInstance(document.getElementById("main_view"));
  var domInfo = TLDomInfo.getInstance();
  var matrixInfo = TLSVGMatrixInfo.getInstance();
  new TLDataController();
  var md = new MobileDetect(window.navigator.userAgent);
  // var globalUrlPattern = /global\/[a-z]{2}\//;
  // var isGlobal = globalUrlPattern.test(location.href);
  if (md.mobile() || md.tablet()) {
    TLG.isMobile = true;
    new TLMobileViewController();
  } else {
    TLG.isMobile = false;
    new TLViewController();
  }

  //===========================================================================
  function debugLine() {
    domInfo.context.strokeStyle = "blue";
    var screenSize = matrixInfo.screenBox.getSize();
    domInfo.context.strokeRect(
      matrixInfo.screenBox.min.x,
      matrixInfo.screenBox.min.y,
      screenSize.x,
      screenSize.y
    );

    domInfo.context.strokeStyle = "red";
    var boundarySize = matrixInfo.screenBoundary.getSize();
    domInfo.context.strokeRect(
      matrixInfo.screenBoundary.min.x,
      matrixInfo.screenBoundary.min.y,
      boundarySize.x,
      boundarySize.y
    );

    domInfo.context.strokeStyle = "black";
    var mapSize = matrixInfo.mapBoundary.getSize();
    domInfo.context.strokeRect(
      matrixInfo.mapBoundary.min.x,
      matrixInfo.mapBoundary.min.y,
      mapSize.x,
      mapSize.y
    );

    domInfo.context.strokeStyle = "yellow";
    var boxSize = matrixInfo.cullingBox.getSize();
    domInfo.context.strokeRect(
      matrixInfo.cullingBox.min.x,
      matrixInfo.cullingBox.min.y,
      boxSize.x,
      boxSize.y
    );
  }

  function drawDebug() {
    if (!TLG.isDebug) {
      return;
    }

    //domInfo.context.globalAlpha = 1.0;
    //domInfo.context.font = "bold 12px Arial";
    //var vLT = matrixInfo.screenBox.min;
    //var scale = matrixInfo.getMatrix().a;
    ////domInfo.context.clearRect(vLT.x, vLT.y, 200,200);
    //
    //domInfo.context.fillStyle = "rgba(22,255,93,0.5)";
    //domInfo.context.fillRect(vLT.x, vLT.y, 200, 100);
    //domInfo.context.fillStyle = '#000000';
    //domInfo.context.fillText('matrix :' +
    //  matrixInfo.getMatrix().e.toFixed(1) + ',  ' +
    //  matrixInfo.getMatrix().f.toFixed(1),
    //  vLT.x + 10, vLT.y + 10);
    //domInfo.context.fillText('base scale :' +
    //  matrixInfo.baseScale.toFixed(5),
    //  vLT.x + 10, vLT.y + 22);
    //domInfo.context.fillText('scale :' +
    //  matrixInfo.scale.toFixed(5),
    //  vLT.x + 10, vLT.y + 34);
    //domInfo.context.fillText('worldMousePos :' +
    //  matrixInfo.worldMousePosition.x.toFixed(0) + ',  '+
    //  matrixInfo.worldMousePosition.y.toFixed(0),
    //  vLT.x + 10, vLT.y + 46);

    domInfo.debugContext.globalAlpha = 1.0;
    domInfo.debugContext.font = "bold 12px Arial";
    var scale = matrixInfo.getMatrix().a;
    domInfo.debugContext.clearRect(0, 0, 200, 100);
    domInfo.debugContext.fillStyle = "rgba(22,255,93,0.5)";
    domInfo.debugContext.fillRect(0, 0, 200, 100);
    domInfo.debugContext.fillStyle = "#000000";
    domInfo.debugContext.fillText(
      "matrix :" +
        matrixInfo.getMatrix().e.toFixed(1) +
        ",  " +
        matrixInfo.getMatrix().f.toFixed(1),
      10,
      10
    );
    domInfo.debugContext.fillText(
      "base scale :" + matrixInfo.baseScale.toFixed(5),
      10,
      22
    );
    domInfo.debugContext.fillText(
      "scale :" + matrixInfo.scale.toFixed(5),
      10,
      34
    );
    domInfo.debugContext.fillText(
      "worldMousePos :" +
        matrixInfo.worldMousePosition.x.toFixed(0) +
        ",  " +
        matrixInfo.worldMousePosition.y.toFixed(0),
      10,
      46
    );
    domInfo.debugContext.fillText(
      "worldCenterPos :" +
        matrixInfo.worldCenterPosition.x.toFixed(0) +
        ",  " +
        matrixInfo.worldCenterPosition.y.toFixed(0),
      10,
      58
    );
    domInfo.debugContext.fillText(
      "worldScreenRadius :" + matrixInfo.worldScreenRadius.toFixed(5),
      10,
      70
    );

    domInfo.debugContext.fillText(
      "sectionWorldMatrix :" +
        matrixInfo.sectionWorldMatrix.e.toFixed(1) +
        ",  " +
        matrixInfo.sectionWorldMatrix.f.toFixed(1),
      10,
      82
    );

    //TLCheckBoundary.getInstance().render();
  }

  //===========================================================================

  eventManager.signals.updateRender.add(render);

  TLEventManager.getInstance().signals.resizeEvent.add(render);
  window.addEventListener("resize", render);

  var smoothing = true;
  domInfo.context.mozImageSmoothingEnabled = smoothing;
  domInfo.context.webkitImageSmoothingEnabled = smoothing;
  domInfo.context.msImageSmoothingEnabled = smoothing;
  domInfo.context.imageSmoothingEnabled = smoothing;

  //var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
  function render() {
    onResize();

    //var p1 = matrixInfo.transformedPoint(0, 0);
    //var p2 = matrixInfo.transformedPoint(domInfo.getWidth(), domInfo.getHeight());
    //var termSpace = 500;//1000;
    //domInfo.context.globalCompositeOperation = "source-over";
    //domInfo.context.clearRect(
    //    p1.x - termSpace,
    //    p1.y - termSpace,
    //    p2.x - p1.x + termSpace * 2,
    //    p2.y - p1.y + termSpace * 2);

    TLSceneManager.getInstance().render();
    drawDebug();
  }

  function onResize() {
    domInfo.updateDomElement();
    matrixInfo.setKeepPosition(
      matrixInfo.getMatrix().e,
      matrixInfo.getMatrix().f
    );

    var termSize = 2;
    matrixInfo.mapBoundary.min.x = matrixInfo.mapBoundary.min.y = -termSize;
    matrixInfo.mapBoundary.max.x = matrixInfo.mapBoundary.max.y =
      matrixInfo.mapSize + termSize;
    matrixInfo.updateSquareBoundary();
    matrixInfo.updateWorldMatrix();

    // render();
  }
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLSceneManagerBase = function () {
  TLEventManager.getInstance().signals.a2c_gotoAreaPlanEvent.add(
    this.gotoAreaPlan.bind(this)
  );
  TLEventManager.getInstance().signals.a2c_gotoSeatPlanEvent.add(
    this.gotoSeatPlan.bind(this)
  );
};

//-------------------------------------------------------
//  Desc : 도면의 관리방법을 셋팅한다.
//-------------------------------------------------------
TLSceneManagerBase.prototype.setLayerInfo = function (data) {
  //영역 유무
  TLG.PLAN_STATE = data.physical.physicalPlan.blockPhysicalPlan
    ? TLG.PLAN_AREA
    : TLG.PLAN_SEAT;

  // [예매대기전용] prefix
  // if (tk.utils.isWaitingReservation()) {
  // 	if (tk.state.waitingDetail.isReservationTypeSection()) {
  // 		TLG.PLAN_STATE = TLG.PLAN_SEAT;
  // 	}
  // }

  // 영역 이미지 노출 스케일 조절
  if (data.physical.physicalPlan.blockPhysicalPlan) {
    // Null, undefined 체크와 함께 화면설정이 false 이고, 배율의 유효성체크까지 통과해야 직접설정 배율로 적용
    if (
      data.physical.physicalPlan.blockExposureFitRatio !== null &&
      data.physical.physicalPlan.blockExposureFitRatio !== undefined &&
      data.physical.physicalPlan.blockExposureMinValue !== null &&
      data.physical.physicalPlan.blockExposureMinValue !== undefined &&
      !data.physical.physicalPlan.blockExposureFitRatio &&
      data.physical.physicalPlan.blockExposureMinValue >=
        TLG.EXPOSURE_SCALE_MIN &&
      data.physical.physicalPlan.blockExposureMinValue <= TLG.EXPOSURE_SCALE_MAX
    ) {
      TLG.EXPOSURE_BLOCK_SCALE =
        data.physical.physicalPlan.blockExposureMinValue * 0.01;
    }
  }

  // 좌석 이미지 노출 스케일 조절
  if (
    data.physical.physicalPlan.areaExposureFitRatio === null ||
    data.physical.physicalPlan.areaExposureFitRatio === undefined ||
    data.physical.physicalPlan.exposureMinValue === null ||
    data.physical.physicalPlan.exposureMinValue === undefined
  ) {
    TLG.EXPOSURE_SCALE = 1.0;
  } else {
    if (data.physical.physicalPlan.areaExposureFitRatio) {
      TLG.EXPOSURE_SCALE =
        TLDomInfo.getInstance().getWidth() /
        tk.state.plan.physical.bgInfo.mapSize;
    } else {
      if (
        data.physical.physicalPlan.exposureMinValue >= TLG.EXPOSURE_SCALE_MIN &&
        data.physical.physicalPlan.exposureMinValue <= TLG.EXPOSURE_SCALE_MAX
      ) {
        TLG.EXPOSURE_SCALE = data.physical.physicalPlan.exposureMinValue * 0.01;
      }
    }
  }

  // TLLogicalSeatLayer 전체 좌석 유무.
  if (data.physical.physicalPlan.planExposure) {
    var isSingleMap =
      data.physical.bgInfo.mapSize <= TLG.LOGICAL_SINGLE_MAP_SIZE;
    TLG.BACKGROUND_TYPE = isSingleMap ? TLG.BG_SINGLE : TLG.BG_TILE;
  } else {
    // 부분 좌석
    TLG.BACKGROUND_TYPE = TLG.BG_SECTION_TILE;
    // 스포츠에서 파티 플로우 석때문에 아래 부분 처리.
    var isSingleMap =
      data.physical.bgInfo.mapSize <= TLG.LOGICAL_SINGLE_MAP_SIZE;
    TLG.BACKGROUND_TYPE = isSingleMap
      ? TLG.BG_EXTENTION_SECTION_TILE
      : TLG.BG_SECTION_TILE;
  }

  // setup Background 순서에 주의
  TLSeatBackgroundLayer.getInstance().setLayerInfo(data.physical.bgInfo);
  TLSeatBackgroundLayer.getInstance().setZoneInfo(data.zoneMap);
  if (TLG.PLAN_STATE === TLG.PLAN_AREA) {
    TLAreaBackgroundLayer.getInstance().setLayerInfo(data.physical.blockBgInfo);
    TLAreaBackgroundLayer.getInstance().setBlockInfo(data.blockMap);
  }
  //미니맵 셋팅.
  TLMiniMapLayer.getInstance().setLayerInfo(
    TLG.PLAN_STATE === TLG.PLAN_AREA
      ? data.physical.blockBgInfo
      : data.physical.bgInfo
  );

  this.setPlanState(TLG.PLAN_STATE);

  //------------------------------------------------------------------------
  if (TLG.PLAN_STATE === TLG.PLAN_SEAT) {
    switch (TLG.BACKGROUND_TYPE) {
      case TLG.BG_SINGLE:
        TLSVGMatrixInfo.getInstance().pagingSectorDetection();
        break;
      case TLG.BG_TILE:
        TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
        TLSVGMatrixInfo.getInstance().pagingSectorDetection();
        break;
    }
    // paging 리스트 던지기
    TLEventManager.getInstance().signals.updateRender.dispatch();
    var s2wBox = TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
    TLSVGMatrixInfo.getInstance().setMoveS2W_Boundary(s2wBox);
  }
  //------------------------------------------------------------------------
  TLSVGMatrixInfo.getInstance().setMoveBoundary();
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLSceneManagerBase.prototype.setPlanState = function (state) {
  switch (state) {
    case TLG.PLAN_AREA:
      TLG.PLAN_STATE = TLG.PLAN_AREA;
      TLDomInfo.getInstance().areaCanvas.style.display = "block";
      TLDomInfo.getInstance().canvas.style.display = "none";
      TLAreaBackgroundLayer.getInstance().updateLayer();
      TLSVGMatrixInfo.getInstance().setMoveBoundary();
      var center = TLAreaBackgroundLayer.getInstance().center;
      TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", center.x, center.y);
      break;
    case TLG.PLAN_SEAT:
      TLG.PLAN_STATE = TLG.PLAN_SEAT;
      TLDomInfo.getInstance().areaCanvas.style.display = "none";
      TLDomInfo.getInstance().canvas.style.display = "block";
      TLSeatBackgroundLayer.getInstance().updateLayer();
      TLSVGMatrixInfo.getInstance().setMoveBoundary();
      var center = TLSeatBackgroundLayer.getInstance().center;
      TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", center.x, center.y);
      break;
    case "BACK":
      TLG.PLAN_STATE = TLG.PLAN_AREA;
      TLDomInfo.getInstance().areaCanvas.style.display = "block";
      TLDomInfo.getInstance().canvas.style.display = "none";
      TLAreaBackgroundLayer.getInstance().updateLayerByBack();
      TLSVGMatrixInfo.getInstance().setMoveBoundary();
      TLSVGMatrixInfo.getInstance().setWarpWorld("BACK");
      break;
    case "NONE":
      TLG.PLAN_STATE = TLG.PLAN_AREA;
      TLDomInfo.getInstance().areaCanvas.style.display = "block";
      TLDomInfo.getInstance().canvas.style.display = "none";
      TLAreaBackgroundLayer.getInstance().updateLayerByBack();
      TLSVGMatrixInfo.getInstance().setMoveBoundary();
      TLSVGMatrixInfo.getInstance().setWarpWorld("NONE");
      break;
  }
};

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
TLSceneManagerBase.prototype.render = function () {
  var p1 = TLSVGMatrixInfo.getInstance().transformedPoint(0, 0);
  var p2 = TLSVGMatrixInfo.getInstance().transformedPoint(
    TLDomInfo.getInstance().getWidth(),
    TLDomInfo.getInstance().getHeight()
  );

  switch (TLG.PLAN_STATE) {
    case TLG.PLAN_AREA:
      TLDomInfo.getInstance().areaContext.globalCompositeOperation =
        "source-over";
      TLDomInfo.getInstance().areaContext.clearRect(
        p1.x,
        p1.y,
        p2.x - p1.x,
        p2.y - p1.y
      );
      TLAreaBackgroundLayer.getInstance().render(
        TLDomInfo.getInstance().areaContext
      );
      break;
    case TLG.PLAN_SEAT:
      TLDomInfo.getInstance().context.globalCompositeOperation = "source-over";
      TLDomInfo.getInstance().context.clearRect(
        p1.x,
        p1.y,
        p2.x - p1.x,
        p2.y - p1.y
      );
      TLSeatBackgroundLayer.getInstance().render(
        TLDomInfo.getInstance().context
      );
      TLLogicalSeatLayer.getInstance().render(TLDomInfo.getInstance().context);
      break;
  }

  var s2wBox = TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  TLSVGMatrixInfo.getInstance().setMoveS2W_Boundary(s2wBox);
  TLToolTipLayer.getInstance().render();
  TLMiniMapLayer.getInstance().render();
};

TLSceneManagerBase.prototype.gotoAreaPlan = function (eventType) {
  if (eventType === "BACK") {
    this.setPlanState("BACK");
  } else if (eventType === "NONE") {
    this.setPlanState("NONE");
  } else {
    this.setPlanState(TLG.PLAN_AREA);
  }
};

TLSceneManagerBase.prototype.gotoSeatPlan = function (blockObj) {
  var vPos = {
    x: blockObj.linkedPoint.x,
    y: blockObj.linkedPoint.y,
  };

  TLDomInfo.getInstance().updateDomElement();

  this.setPlanState(TLG.PLAN_SEAT);

  switch (TLG.BACKGROUND_TYPE) {
    case TLG.BG_SINGLE:
      TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", vPos.x, vPos.y);
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
      break;
    case TLG.BG_TILE:
      TLSVGMatrixInfo.getInstance().setWarpWorld("NORMAL", vPos.x, vPos.y);
      TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
      break;
    case TLG.BG_SECTION_TILE:
      TLLogicalSeatLayer.getInstance().clearImageTile();
      TLSVGMatrixInfo.getInstance().setMoveBoundary(blockObj.cornerPoints);
      TLSVGMatrixInfo.getInstance().setWarpSectionWorld(
        vPos,
        blockObj.vectorPoint
      );
      TLSeatBackgroundLayer.getInstance().pagingSectorDetectionBG();
      // block 일때는 안한다.
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
      //TLSVGMatrixInfo.getInstance().setWarpWorld(vPos.x, vPos.y);
      break;
    case TLG.BG_EXTENTION_SECTION_TILE:
      TLLogicalSeatLayer.getInstance().clearImageTile();
      TLSVGMatrixInfo.getInstance().setMoveBoundary(blockObj.cornerPoints);
      TLSVGMatrixInfo.getInstance().setWarpSectionWorld(
        vPos,
        blockObj.vectorPoint
      );
      TLSVGMatrixInfo.getInstance().pagingSectorDetection();
      break;
  }

  // paging 리스트 던지기
  TLEventManager.getInstance().signals.updateRender.dispatch();
  var s2wBox = TLSVGMatrixInfo.getInstance().updateScreenToWorldBox();
  TLSVGMatrixInfo.getInstance().setMoveS2W_Boundary(s2wBox);
};

var TLSceneManager = Singletonify(TLSceneManagerBase);

//-------------------------------------------------------
//  Desc : event Manager
//-------------------------------------------------------
var TLEventManagerBase = function () {
	var SIGNALS = signals;
	this.signals = {
		// Data Event
		a2c_standbyFinEvent: new SIGNALS.Signal(), // [예매대기] viewstandBy이후 불리는 함수
		a2c_planInfoResponseEvent: new SIGNALS.Signal(),
		a2c_gotoSeatPlanEvent: new SIGNALS.Signal(),
		a2c_gotoAreaPlanEvent: new SIGNALS.Signal(),

		c2a_selectBlockEvent: new SIGNALS.Signal(),
		c2a_selectSeatEvent: new SIGNALS.Signal(),  // seat   1개씩
		c2a_selectZoneEvent: new SIGNALS.Signal(),  // 비지정석 1개씩

		// View Event
		updateRender: new SIGNALS.Signal(),

		//없앨꺼
		resizeEvent: new SIGNALS.Signal()
	};
};

var TLEventManager = Singletonify(TLEventManagerBase);

//-------------------------------------------------------
//  Desc :
//-------------------------------------------------------
var TLDataController = function () {
	TLEventManager.getInstance().signals.a2c_planInfoResponseEvent.add(planInfoResponse);

	function planInfoResponse () {
		TLSceneManager.getInstance().setLayerInfo(tk.state.plan);
		TLLogicalSeatLayer.getInstance();
		// 미니맵 --------------------------
		TLMiniMapLayer.getInstance();
		new TLMiniMapViewController();
		//---------------------------------

		TLEventManager.getInstance().signals.a2c_standbyFinEvent.dispatch();

		//TLLogicalSeatLayer.getInstance().pagingSeatInfo(data.data.able);
	}


	var scope = this;
};

/**
 * @author donghyun seo
 * @desc Angular 모듈
 */
(function () {
	'use strict';

	angular
		.module('tklProject', ['hmTouchEvents', 'vs-repeat']);
})();

/**
 * @author donghyun seo
 * @desc Angular 상수
 * @external tk.apis
 */
(function () {
	'use strict';

	var am = angular
		.module('tklProject');
	if (tk.apis) {
		am.constant('apiManager', {
			reservePlan: tk.apis.reservePlan
		});
	}
})();

var RESERVATION_TYPE = {
	'SEAT': {
		type: 'SEAT',
		selectBoxText: '원하는 좌석 선택',
		info: {},
	},
	'SECTION': {
		type: 'SECTION',
		selectBoxText: '원하는 구역 선택',
		info: {},
	}
};

var POPUP_TYPE = {
	RESERVATION_TYPE: {
		type: 'reservationType',
	},
	GRADE_TYPE: {
		type: 'gradeType',
	},
	RESERVATION_TICKET: {
		type: 'reservationTicket',
	},
	MOBILE_RESERVATION: {
		type: 'mobileReservation',
	}
};

var NOTIFY_TYPE = {
	CELL_PHONE_NO: {
		key: 'CELL_PHONE_NO',
		index: 0,
		text: '휴대폰번호',
	},
	EMAIL: {
		key: 'EMAIL',
		index: 1,
		text: '이메일',
	},
};

var DATE_FORMAT = {
	IN_SALE: 'M월 D일 HH:mm',
};

/**
 * @author donghyun seo
 * @desc 예약 날짜 filter
 * @external tk.utils, tk.i18n.translate
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.filter('reservationDate', function () {
			return function (input) {
				if (input === null) {
					return "";
				}

				var _date = moment.tz(input, "Asia/Seoul");

				var week = tk.i18n.translate.getTranslate("WEEK");
				var dateFormat = "{0}.{1}.{2}({3}) {4}:{5}";

				return tk.utils.format.call(dateFormat,
					_date.year(),
					_date.month() + 1,
					_date.date(),
					week[_date.day()],
					tk.utils.leftPad(_date.hours(), '0', 2),
					tk.utils.leftPad(_date.minute(), '0', 2));
			};
		});
})();

/**
 * @author donghyun seo
 * @desc 글로벌 filter
 * @external tk.utils, tk.i18n.translate
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.filter('translate', function () {
			return function (key) {
				var args;
				if (arguments.length > 1) {
					args = Array.prototype.slice.call(arguments, 1);
				}

				return tk.i18n.translate.getTranslate(key, args);
			};
		})
		.filter('translateToggle', function () {
			return function (key, toggle) {
				if (!toggle) {
					return ''
				}
				var args;
				if (arguments.length > 2) {
					args = Array.prototype.slice.call(arguments, 2);
				}

				return tk.i18n.translate.getTranslate(key, args);
			};
		});
})();

/**
 * require : tk.state.device
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('iosDblclick',
			function () {
				var tkDeviceState = tk.state.device;

				return {
					restrict: 'A',
					link: function (scope, element, attrs) {
						if (!tkDeviceState.isIOSMobileApp()) {
							return;
						}

						element.on('touchstart', function (e) {
							var t2 = e.timeStamp
								, t1 = $(this).data('lastTouch') || t2
								, dt = t2 - t1
								, fingers = e.originalEvent.touches.length
								, isSameTarget = false;
							$(this).data('lastTouch', t2);

							if (tkDeviceState.previousTouchTarget) {
								isSameTarget = tkDeviceState.previousTouchTarget === e.target;
							}
							tkDeviceState.previousTouchTarget = e.target;

							if (!dt || dt > 500 || fingers > 1) {// not double-tap
								return;
							}

							// if (!dt || dt > 500 || fingers > 1 || !isSameTarget) {// not double-tap
							// 	return;
							// }
							e.preventDefault();
						});
					}
				};
			});
})();

/**
 * @author donghyun seo
 * @desc Disabled Component
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('tklDisabled', tklDisabled);

	tklDisabled.$inject = ['$parse'];
	/**
	 * @description 비활성 지시자
	 */
	function tklDisabled ($parse) {
		var directive = {
			restrict: 'A',
			link: linkFun
		};

		return directive;

		function linkFun (scope, elem, attrs) {
			var disabled = $parse(attrs['tklDisabled'])(scope);

			var disabledStyle = $parse(attrs['tklDisabledStyle'])(scope); // [On, Off]
			var hasStyle = false;

			if (Array.isArray(disabledStyle) && disabledStyle.length > 1) {
				hasStyle = true;
			}

			scope.$watch(disabled, function (isDisable) {

				if (isDisable) { // 비활성화이면 비활성화 처리
					elem.addClass("disabled");
					elem.attr("disabled", "");

					if (hasStyle) {
						elem.css(disabledStyle[0]);
					}
				} else { // 비활성화가 아니면 비활성화 처리 해제
					elem.removeClass("disabled");
					elem.removeAttr("disabled");

					if (hasStyle) {
						elem.css(disabledStyle[1]);
					}
				}
			});
		}
	}
})();

/**
 * @author donghyun seo
 * @desc 선택된 좌석(모바일 등급선택)
 * @external tk.utils, tk.state.plan, tk.state.device, tk.event.service, tk.event.view, tk.state.select, tk.state.view,
 */
(function () {
  "use strict";

  angular.module("tklProject").directive("tklSelectedSeatInfo", function () {
    return {
      templateUrl: function () {
        var tkDeviceState = tk.state.device;
        var template = tkDeviceState.getTemplateOfDevice();
        return tk.utils.addQueryTime(
          "/resources/jsdev/reserve/seat/ui/component/selectedSeatInfo/selectedSeatInfo" +
            template +
            ".html"
        );
      },
      transclude: true,
      replace: true,
      scope: {},
      bindToController: {},
      controller: TklSelectedSeatInfoController,
      controllerAs: "selected",
    };
  });

  TklSelectedSeatInfoController.$inject = [
    "$scope",
    "$element",
    "$document",
    "$timeout",
    "captcha",
    "ticket",
  ];

  /**
   * @description Debounce 처리 (일정 시간 내에 일어난 새로고침 등의 이벤트를 하나로 모아서 요청)
   */
  var _debounce = function (func, delay) {
    var time;
    return function () {
      var context = this;
      if (time) {
        clearTimeout(time);
      }

      time = setTimeout(function () {
        func.apply(context);
      }, delay);
    };
  };

  /**
   * @description 선택된 좌석(모바일 등급선택) 컨트롤러
   */
  function TklSelectedSeatInfoController(
    $scope,
    $element,
    $document,
    $timeout,
    captcha,
    ticket
  ) {
    var seatTabArea = document.getElementById("seat_tab_area");
    if (seatTabArea) {
      var dom;
      if (tk.utils.isWaitingReservation()) {
        dom = seatTabArea.children[1];
      } else {
        dom = seatTabArea.children[0];
      }
      TLMobileDomInfo.getInstance(dom);
    }

    var ctrl = this;
    var isReady = false;

    var tkPlanState = tk.state.plan;
    var tkDeviceState = tk.state.device;
    var tkSelectState = tk.state.select;
    var tkViewState = tk.state.view;
    var tkWaitingDetail = tk.state.waitingDetail;

    ctrl.isLocaleKO = tk.i18n.translate.locale === "ko";

    ctrl.viewState = tkViewState;
    ctrl.selectState = tkSelectState;
    ctrl.selectedSeatsAndZones = [];
    ctrl.selectedTotalCount = 0;

    ctrl.currentTicketCount = 0;
    ctrl.userMaxTicketCount = 0;

    ctrl.isWaitingReservation = tk.utils.isWaitingReservation();
    if (ctrl.isWaitingReservation) {
      ctrl.isShowCountExposure = tkWaitingDetail.showCountExposure();
      ctrl.isShowAvailableCountExposure =
        tkWaitingDetail.showAvailableCountExposure();
      ctrl.waitingTabShow = false;
      ctrl.tabType = null;
      ctrl.reservationType = tkWaitingDetail.getReservationType();
      ctrl.selectedSectionMap = [];
      ctrl.allSectionSelect = false; // 모든 구역 선택하기
      ctrl.sectionInBlocks = [];
      // ctrl.blockText = ''; // 선택된 구역 텍스트

      ctrl.onTabClick = function (type) {
        ctrl.waitingTabShow = true;
        ctrl.tabType = type;
        if (type === "WAITING_INFO") {
          _updateMobileSeatLayerOpen(true);
          tkViewState.seatInfo.css("display", "block");
        }
        if (type === "SEAT_INFO") {
        }
        tk.event.ui.signals.updateMobileCss.dispatch({
          waitingTabShow: true,
        });
      };

      ctrl.onTabClose = function () {
        ctrl.waitingTabShow = false;

        tk.event.ui.signals.updateMobileCss.dispatch({
          waitingTabShow: false,
        });
      };

      preActiveForWaiting();
    }

    ctrl.clearSelectedSeats = _clearSelectedSeats;
    ctrl.isAutoShow = _isAutoShow;
    ctrl.isSelfShow = _isSelfShow;
    ctrl.isAutoSelfShow = _isAutoSelfShow;

    // 모바일 ------------------------------
    ctrl.isNextAble = _isNextAble;
    ctrl.layerToggle = _layerToggle;
    ctrl.selectedSeatLayerToggle = _selectedSeatLayerToggle;
    ctrl.clearAllPlan = _debounce(_clearAllPlan, 500);
    tkViewState.selectSeatInfo = angular.element(
      $document[0].getElementById("select_seat_lst_area")
    ); // 등급선택 엘리먼트
    // ------------------------------------

    if (!captcha.needAuth && !ticket.needTicketType) {
      activate();
    }

    function initViewData() {
      activate();
    }

    var isMobile = tkDeviceState.isMobile();
    if (isMobile) {
      _updateMobileSeatLayerOpen(tkPlanState.hasArea, true);
    }

    $scope.$on("onCaptchaAuth", initViewData);
    $scope.$on("onTicketType", initViewData);

    function preActiveForWaiting() {
      tk.event.service.signals.s2u_updatedWaitingInfo.add(updateWaitingInfo);

      /**
       * @description 예매대기 정보 갱신
       */
      function updateWaitingInfo() {
        if (!ctrl.isWaitingReservation) {
          return;
        }
        var tickets = tkWaitingDetail.getTicketsInfo();
        ctrl.currentTicketCount = tickets.currentTicketCount;
        ctrl.userMaxTicketCount = tickets.userMaxTicketCount;
        ctrl.reservationType = tkWaitingDetail.getReservationType();
      }
    }

    function resizeView() {
      try {
        if (ctrl.viewState.isMobileSeatLayerOpen) {
          tkViewState.mainView.css("bottom", $element.height() + 70 + "px");
        } else {
          tkViewState.mainView.css("bottom", "110px");
        }
      } catch (error) {
        setTimeout(function () {
          resizeView();
        }, 100);
        return;
      }

      $scope.$evalAsync();

      // 리사이즈 이벤트
      TLEventManager.getInstance().signals.resizeEvent.dispatch();
      if (!isReady) {
        if (!tkPlanState.hasArea) {
          TLSceneManager.getInstance().setPlanState(TLG.PLAN_SEAT);
        }
        isReady = true;
      }
    }

    function activate() {
      tk.event.service.signals.s2u_updatedSelectedSeat.add(updatedSelectedSeat);
      tk.event.ui.signals.updateMobileCss.add(updateMobileCss);

      /**
       * @description 선택된 좌석 정보 갱신
       */
      function updatedSelectedSeat() {
        ctrl.selectedSeatsAndZones = tkSelectState.getSelectSeatsAndZones();
        ctrl.selectedTotalCount = tkSelectState.getTotalCnt();

        // 모바일 ------------------------------------------------
        // 선택좌석이 없어질 경우 선택좌석 레이어 해제
        if (
          tkDeviceState.isMobile() &&
          tkSelectState.isSelectSeatsAndZonesEmpty()
        ) {
          ctrl.viewState.isMobileSelectedSeatLayerOpen = false;
        }
        // ------------------------------------------------------
        $scope.$evalAsync();
      }

      /**
       * @description 모바일 신청정보 관련 CSS
       */
      function updateMobileCss(items) {
        if (items.hasOwnProperty("tabType")) {
          if (items.tabType === null) {
            ctrl.waitingTabShow = false;
            ctrl.tabType = null;
          } else {
            ctrl.waitingTabShow = true;
            ctrl.tabType = items.tabType;
            if (items.tabType === "WAITING_INFO") {
              _updateMobileSeatLayerOpen(true);
              tkViewState.seatInfo.css("display", "block");
            }
          }
        }
      }

      // 모바일 ----------------------------------------------------------------
      // 뷰 리사이즈 처리
      tk.event.view.signals.resizeView.add(resizeView);
      var isMobile = tkDeviceState.isMobile();
      if (isMobile) {
        resizeView();
      }
      // -----------------------------------------------------------------------

      if (ctrl.isWaitingReservation) {
        tk.event.service.signals.updatedReservationData.add(sectionMapUpdate);

        /**
         * @description 구역형 좌석  Update
         */
        function sectionMapUpdate() {
          ctrl.sectionInBlocks = [];
          ctrl.sectionInBlocks = tkWaitingDetail.getSectionInBlock();

          // 모바일 구역형 탭 CSS조작을 위한 dispatch
          tk.event.ui.signals.updateMobileCss.dispatch({
            waitingTabShow: "ignore",
          });
        }

        tk.event.service.signals.s2u_updatedSectionInBlock.add(
          updatedSelectedSection
        );

        function updatedSelectedSection(updateObject) {
          if (updateObject) {
            if (updateObject.hasOwnProperty("isClear")) {
              if (updateObject.isClear) {
                ctrl.allSectionSelect = false;
              }
            } else if (updateObject.hasOwnProperty("selectSection")) {
              var selectSection = updateObject.selectSection;

              selectSection.map(function (currentSection) {
                ctrl.sectionInBlocks = ctrl.sectionInBlocks.map(function (
                  block
                ) {
                  block.sections = block.sections.map(function (section) {
                    if (currentSection.blockId === section.blockId) {
                      section.selected = !section.selected;
                    }
                    return section;
                  });
                  return block;
                });
              });
              ctrl.isSelectedAll();
              tkSelectState.updateSelectSection(ctrl.sectionInBlocks);
            } else if (updateObject.hasOwnProperty("selectGrade")) {
              var block = updateObject.selectGrade.block;
              var grades = updateObject.selectGrade.grades;

              grades.map(function (currentGrade) {
                var idx = ctrl.sectionInBlocks
                  .map(function (grade) {
                    return grade.gradeId;
                  })
                  .indexOf(currentGrade.gradeId);

                if (idx === -1) {
                  return;
                }

                ctrl.sectionInBlocks[idx].sections = ctrl.sectionInBlocks[
                  idx
                ].sections.map(function (section) {
                  if (block.blockId === section.blockId) {
                    section.selected = currentGrade.selected;
                  }
                  return section;
                });
              });

              ctrl.isSelectedAll();
              tkSelectState.updateSelectSection(ctrl.sectionInBlocks);
            }
            $scope.$evalAsync();
          }

          //===== S: 선택된 좌석정보 업데이트 =====//
          var selectedSectionInBlockMap = JSON.parse(
            JSON.stringify(tkSelectState.selectedSectionInBlockMap)
          );
          var selectedSectionMap = tkWaitingDetail.selectedSections(
            selectedSectionInBlockMap
          );
          var selectedMap = [];

          selectedSectionMap.map(function (block) {
            block.sections.map(function (section) {
              if (section.selected) {
                selectedMap.push({
                  color: block.color,
                  blockName: block.name,
                  sectionName: section.name,
                  sectionCount: section.remainCnt,
                  sectionWaitingCnt: section.waitingCnt,
                });
              }
            });
          });
          ctrl.selectedSectionMap = selectedMap;
          //===== E: 선택된 좌석정보 업데이트 =====//
        }

        ctrl.selectedSections = function () {
          var filterdSectionInBlocks = tkWaitingDetail.selectedSections(
            ctrl.sectionInBlocks
          );

          // 안내문구 노출 업데이트
          tkSelectState.updateSelectSection(filterdSectionInBlocks);
          tk.event.service.signals.s2u_updatedSectionInBlock.dispatch();

          return tkWaitingDetail.selectedSectionsText(filterdSectionInBlocks);
        };

        ctrl.isSelectedAll = function () {
          var isSelected = tkWaitingDetail.isSectionSelectedAll(
            ctrl.sectionInBlocks
          );
          ctrl.allSectionSelect = isSelected;
          return isSelected;
        };

        ctrl.onSelectAllClick = function (isAllSelect) {
          ctrl.selectAll(isAllSelect);
        };

        ctrl.selectAll = function (isAllSelect) {
          ctrl.allSectionSelect = isAllSelect;

          var sectionInBlocks = tkWaitingDetail.sectionSelectAll(
            ctrl.sectionInBlocks,
            isAllSelect
          );
          // 안내문구 노출 업데이트
          tkSelectState.updateSelectSection(isAllSelect ? sectionInBlocks : []);

          tk.event.service.signals.s2u_updatedSectionInBlock.dispatch();
          // ctrl.blockText = ctrl.selectedSections();
        };

        ctrl.onSectionClick = function (section) {
          if (section.remainCnt < ctrl.currentTicketCount) {
            alert("필요한 취소표 수 보다 작은 구역은 선택할 수 없습니다.");
            return;
          }

          section.selected = !section.selected;
          ctrl.isSelectedAll();
          tkSelectState.updateSelectSection(ctrl.sectionInBlocks);
          tk.event.service.signals.s2u_updatedSectionInBlock.dispatch();
        };
      }
    }

    /**
     * @description 선택좌석 초기화
     */
    function _clearSelectedSeats() {
      if (tk.utils.isWaitingReservation()) {
        if (ctrl.reservationType === "SEAT") {
          // 좌석형
          tkSelectState.clearSelectedSeats();
        } else {
          // 구역형
          tkSelectState.updateSelectSection([]);
          tk.event.service.signals.s2u_updatedSectionInBlock.dispatch({
            isClear: true,
          });
        }
      } else {
        tkSelectState.clearSelectedSeats();
      }
    }

    /**
     * @description 자동배정 문구 노출 여부 반환
     * @return {Boolean} 자동배정 문구 노출 여부
     */
    function _isAutoShow() {
      var isSelectedTypeNone =
        ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.NONE;
      var isAutoProduct =
        isSelectedTypeNone &&
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO;
      var isSelectedTypeAuto =
        ctrl.selectState.selectedType ===
        ctrl.selectState.SELECTED_TYPE.AUTO_SELECT;
      return (
        (isAutoProduct || isSelectedTypeAuto) &&
        !ctrl.selectState.hasSelectedSeats
      );
    }

    /**
     * @description 직접선택 문구 노출 여부 반환
     * @return {Boolean} 직접선택 문구 노출 여부
     */
    function _isSelfShow() {
      var isSelectedTypeNone =
        ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.NONE;
      var isDirectProduct =
        isSelectedTypeNone &&
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT;
      var isSelectedTypeSelf =
        ctrl.selectState.selectedType ===
        ctrl.selectState.SELECTED_TYPE.SELF_SELECT;
      return (
        (isDirectProduct || isSelectedTypeSelf) &&
        !ctrl.selectState.hasSelectedSeats
      );
    }

    /**
     * @description 직접선택, 자동선택 문구 노출 여부 반환
     * @return {Boolean} 직접선택, 자동선택문구 노출 여부
     */
    function _isAutoSelfShow() {
      var isAutoSelfProduct =
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO_DIRECT;
      var isSelectedTypeNone =
        ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.NONE;
      return (
        isAutoSelfProduct &&
        isSelectedTypeNone &&
        !ctrl.selectState.hasSelectedSeats
      );
    }

    // 모바일 ----------------------------------------------------------------------
    /**
     * @description 다음단계 버튼 활성화 여부 반환
     * @return {Boolean} 다음단계 버튼 활성화
     */
    function _isNextAble() {
      return tkSelectState.selectedGrade && tkSelectState.hasSelectedSeats;
    }

    /**
     * @description 등급 선택 레이어 토글
     * @param {Object} e 이벤트 객체
     */
    function _layerToggle(e) {
      if (e.hasOwnProperty("stopPropagation")) {
        e.stopPropagation();
      }

      _updateMobileSeatLayerOpen(!ctrl.viewState.isMobileSeatLayerOpen);

      if (ctrl.viewState.isMobileSelectedSeatLayerOpen) {
        if (ctrl.viewState.isMobileSeatLayerOpen) {
          tkViewState.selectSeatInfo.css("display", "block");
        } else {
          tkViewState.selectSeatInfo.css("display", "none");
        }
      } else {
        if (ctrl.viewState.isMobileSeatLayerOpen) {
          tkViewState.seatInfo.css("display", "block");
        } else {
          tkViewState.seatInfo.css("display", "none");
        }
      }
    }

    /**
     * @description 선택된 좌석 레이어 토글
     */
    function _selectedSeatLayerToggle() {
      if (!ctrl.viewState.isMobileSeatLayerOpen) {
        _updateMobileSeatLayerOpen(true);
      }
      ctrl.viewState.isMobileSelectedSeatLayerOpen =
        !ctrl.viewState.isMobileSelectedSeatLayerOpen;

      if (
        ctrl.viewState.isMobileSelectedSeatLayerOpen &&
        ctrl.viewState.isMobileSeatLayerOpen
      ) {
        tkViewState.selectSeatInfo.css("display", "block");
      }

      // 선택좌석 토글 후, Angular 갱신을 위한 처리
      $timeout(function () {}, 60);
    }

    /**
     * @description 모바일 전체 새로고침
     */
    var currentRefreshCount = 0;
    var maxRefreshCount = 50;

    function _clearAllPlan() {
      if (!tk.utils.isWaitingReservation()) {
        if (maxRefreshCount <= currentRefreshCount) {
          location.reload();
        }
        currentRefreshCount++;
      }

      tkWaitingDetail.startLoading("refresh");
      tkSelectState.clearSelectedSeats();
      tkViewState.clearSelectedSeats();
      tkSelectState.claerSelectSection();
      ctrl.selectedSectionMap = [];
      ctrl.allSectionSelect = false;
      tk.event.service.signals.updateAliveGrade.dispatch();
      tk.event.service.signals.updateSeatWaitingLinked.dispatch();
      tk.event.service.signals.updateReservationSeatData.dispatch();
      tk.event.service.signals.updateReservationData.dispatch();
      $scope.$evalAsync();
      tkWaitingDetail.endLoading("refresh");
    }

    function _updateMobileSeatLayerOpen(isOpen, ignoreFlag) {
      ctrl.viewState.isMobileSeatLayerOpen = isOpen;
      if (!ignoreFlag) {
        tkViewState.isMobileSeatLayerOpen = isOpen;
      }
    }

    // ----------------------------------------------------------------------------
  }
})();

/**
 * @author donghyun seo
 * @desc 좌석도면
 * @external tk.utils, tk.state.develop, tk.state.plan, tk.state.device, tk.event.service, tk.state.global, tk.state.select
 * tk.event.view, tk.state.view
 */
(function () {
  "use strict";

  angular.module("tklProject").directive("tklMainView", function () {
    return {
      templateUrl: function () {
        var tkDeviceState = tk.state.device;
        var template = tkDeviceState.getTemplateOfDevice();
        return tk.utils.addQueryTime(
          "/resources/jsdev/reserve/seat/ui/component/view/mainView" +
            template +
            ".html"
        );
      },
      transclude: true,
      replace: true,
      scope: {},
      controller: TklMainViewController,
      controllerAs: "view",
    };
  });

  TklMainViewController.$inject = [
    "$scope",
    "$element",
    "$document",
    "$rootScope",
    "bigProductYn",
    "captcha",
    "ticket",
  ];

  /**
   * @description Debounce 처리 (일정 시간 내에 일어난 새로고침 등의 이벤트를 하나로 모아서 요청)
   */
  var _debounce = function (func, delay) {
    var time;
    return function () {
      var context = this;
      if (time) {
        clearTimeout(time);
      }

      time = setTimeout(function () {
        func.apply(context);
      }, delay);
    };
  };

  /**
   * @description 좌석도면 컨트롤러
   */
  function TklMainViewController(
    $scope,
    $element,
    $document,
    $rootScope,
    bigProductYn,
    captcha,
    ticket
  ) {
    var ctrl = this;
    var mainView = $element;
    var stageDirection = null;

    var tkDevelopState = tk.state.develop;
    var tkPlanState = tk.state.plan;
    var tkSelectState = tk.state.select;
    var tkViewState = tk.state.view;
    var tkWaitingDetailState = tk.state.waitingDetail;

    ctrl.global = tk.state.global;

    ctrl.planState = tkPlanState;
    ctrl.viewState = tkViewState;
    ctrl.developState = tkDevelopState;
    ctrl.isMinimapExposure = tkPlanState.minimapExposure;
    ctrl.hasArea = tkPlanState.hasArea;
    ctrl.waitingTabShow = false;

    ctrl.isWaitingReservation = tk.utils.isWaitingReservation();
    ctrl.isSection = tkWaitingDetailState.isReservationTypeSection();
    // ctrl.isViewAllView = ctrl.isWaitingReservation;
    ctrl.bgSingle = "";

    ctrl.allView = _allView;
    ctrl.zoom = _zoom;
    ctrl.refresh = _debounce(_refresh, 100);
    ctrl.isAutoShow = _isAutoShow;
    ctrl.isAutoSelfShow = _isAutoSelfShow;

    $scope.plan = tk.state.plan;
    $scope.sectionDimmed = tkWaitingDetailState.getSectionDimmed();
    $scope.reservationType = "";
    $scope.reservationWaitingPage = tk.utils.moveReservationWaitingPage;
    $scope.showNotSaleReservationWaiting =
      tk.utils.showNotSaleReservationWaiting;
    $scope.showReadyButton =
      tk.state.plan.isWaitingReservationAvail &&
      tk.state.plan.scheduleWaitingReservation.saleStatus ===
        WAITING_SALE_STATUS["BEFORE"];
    $scope.showInSaleButton =
      tk.state.plan.isWaitingReservationAvail &&
      tk.state.plan.scheduleWaitingReservation.saleStatus ===
        WAITING_SALE_STATUS["INSALE"];

    // 모바일 -------------------------------
    tkViewState.mainView = mainView; // 리사이즈를 위해서
    // ------------------------------------

    TLDomInfo.getInstance(document.getElementById("main_view"));

    if (!captcha.needAuth && !ticket.needTicketType && !bigProductYn) {
      initViewData();
    }

    if (bigProductYn && !captcha.needAuth && !ticket.needTicketType) {
      tk.util.loading.loadingOn();
      // 빅공연모드
      // var ranSec = Math.floor(((Math.random() * 2) + 1) * 1000); // 1~3초
      var ranSec = 1000;
      setTimeout(function () {
        tk.util.loading.loadingOff();
        initViewData();
      }, ranSec);
    }

    function initViewData() {
      tk.event.service.signals.updateReservationData.dispatch();
      activate();
    }

    function waitingInitViewData() {
      tk.state.global.waitingInit();

      if (tk.utils.isWaitingReservation()) {
        if (tk.state.global.meta.frontPlanTypeCode === 'WAITING_APPLICATION') {
          tk.state.waitingDetail.getSchedulesList();
        }
      }

      initViewData();

      ctrl.isSection = tkWaitingDetailState.isReservationTypeSection();
      $scope.reservationType = tkWaitingDetailState.getReservationType();
      ctrl.bgSingle = TLG.PLAN_STATE === TLG.PLAN_SEAT ? 'SEAT' : 'AREA';
    }

    tk.event.service.signals.refreshMainView.add(_refresh);
    $scope.$on('onCaptchaAuth', initViewData);
    $scope.$on('onTicketType', waitingInitViewData);
    $scope.$on('mainViewRefresh', _refresh);
    $scope.$on('reservationTypeRefresh', _reservationTypeRefresh);
    $scope.$on('refreshCount', _refreshCount);

    function activate() {
      tk.event.ui.signals.updateWaitingDetail.add(waitingInfoComponentUpdate);
      tk.event.ui.signals.updateMobileCss.add(updateMobileCss);
      tk.event.service.signals.updateAliveGrade.add(updateAliveGrade);

      /**
       * @description waitingInfoComponentUpdate scope Update
       * @param {object} Update된 Object
       */
      function waitingInfoComponentUpdate(updateObject) {
        var keys = Object.keys(updateObject);
        var len = keys.length;
        if (len !== 0) {
          for (var i = 0; i < len; i++) {
            var key = keys[i];
            if ($scope.hasOwnProperty(key)) {
              $scope[key] = updateObject[key];
            }
          }
          $scope.$evalAsync();
        }
      }

      function updateMobileCss(items) {
        if (items.hasOwnProperty('waitingTabShow')) {
          if (items.waitingTabShow !== 'ignore') {
            ctrl.waitingTabShow = items.waitingTabShow;
            $scope.$evalAsync();
          }
        }
      }

      function updateAliveGrade() {
        if (tk.utils.isWaitingReservation()) {
          if (tkWaitingDetailState.useGradeSelect) {
            tkWaitingDetailState.getAvailGrade();
          }
        }
      }

      /**
       * main view 진입점
       */
      tk.event.view.signals.viewStandby.dispatch(
        tk.state.view.VIEW_TYPE.MAIN_VIEW
      );

      if (tk.state.device.isMobile()) {
        tk.event.view.signals.viewStandby.dispatch(
          tk.state.view.VIEW_TYPE.MINIMAP_VIEW
        );
      }

      tk.event.ui.signals.updateStageDirection.add(updateStageDirection);

      function updateStageDirection() {
        if (!tkPlanState.isPartExposure()) {
          return;
        }
        var isPartView = tkViewState.isPartView();
        stageDirection = angular.element(
          $document[0].getElementById('stage_direction')
        );

        if (!stageDirection) {
          return;
        }

        if (isPartView) {
          stageDirection.css('display', 'block');
        } else {
          stageDirection.css('display', 'none');
        }
        $scope.$evalAsync();
      }
    }

    ctrl.onDimmedClick = function () {
      tkWaitingDetailState.setSectionDimmed(ctrl.bgSingle, false);
      $scope.sectionDimmed = tkWaitingDetailState.getSectionDimmed();
    };

    /**
     * @description 구역 보기 선택
     */
    function _allView() {
      if (ctrl.hasArea) {
        tk.event.ui.signals.backToArea.dispatch();
      } else {
        TLSVGMatrixInfo.getInstance().resetViewSize();
      }
    }

    /**
     * @description 버튼으로 줌인 줌아웃 처리
     * @param {Number} type 줌인/줌아웃 타입
     */
    function _zoom(type) {
      // 줌인, 줌아웃
      tk.event.ui.signals.zoom.dispatch(type);
    }

    /**
     * @description 좌석도면 새로고침
     */
    var currentRefreshCount = 0;
    var maxRefreshCount = 50;

    function _refreshCount() {
      if (!tk.utils.isWaitingReservation()) {
        if (maxRefreshCount <= currentRefreshCount) {
          location.reload();
        }
        currentRefreshCount++;
      }
    }

    function _refresh() {
      $rootScope.$broadcast("refreshCount");

      tkWaitingDetailState.startLoading('refresh');

      // let canUpdate = true;
      // try {
      //   canUpdate = tk.controller.data.checkProcessAndUpdate();
      // } catch (e) {
      //   console.log('checkProcessAndUpdate Error', e);
      // }

      // if (canUpdate) {
        tkSelectState.clearSelectedSeats();
        tkViewState.clearSelectedSeats();
        tkSelectState.claerSelectSection();
        tk.event.service.signals.updateAliveGrade.dispatch();
        tk.event.service.signals.updateSeatWaitingLinked.dispatch();
        tk.event.service.signals.updateReservationSeatData.dispatch();
        tk.event.service.signals.updateReservationData.dispatch();
        tk.event.service.signals.s2u_updatedSectionInBlock.dispatch({
          isClear: true
        });
      // }
      setTimeout(function () {
        tk.state.waitingDetail.endLoading('refresh');
      }, 100);
    }

    /**
     * @description 자동배정에 따른 문구 처리 여부(현재 스펙 아웃)
     * @return {Boolean} 자동배정에 따른 문구 처리 여부
     */
    function _isAutoShow() {
      var isAutoProduct =
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO;
      return isAutoProduct;
    }

    /**
     * @description 직접선택에 따른 문구 처리 여부(현재 스펙 아웃)
     * @return {Boolean} 직접선택에 따른 문구 처리 여부
     */
    function _isAutoSelfShow() {
      var isAutoSelfProduct =
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO_DIRECT;
      return (
        isAutoSelfProduct &&
        !tkSelectState.selectedGrade &&
        !tkPlanState.hasArea
      );
    }

    function _reservationTypeRefresh() {
      tkPlanState.reservationWaitingRelease();
      tk.event.service.signals.updateSeatWaitingLinked.dispatch();
      tk.event.service.signals.updateReservationData.dispatch();
      tk.event.service.signals.updateReservationSeatData.dispatch();
      TLSceneManager.getInstance().setPlanState(
        tkPlanState.physical.physicalPlan.blockPhysicalPlan
          ? TLG.PLAN_AREA
          : TLG.PLAN_SEAT
      );
      tk.event.ui.signals.updateSelectedGrade.dispatch();

      tk.event.ui.signals.refreshWaitingDetail.dispatch();

      ctrl.isSection = tkWaitingDetailState.isReservationTypeSection();
      // ctrl.isViewAllView = ctrl.isWaitingReservation;

      $scope.sectionDimmed = tkWaitingDetailState.getSectionDimmed();
      $scope.reservationType = tkWaitingDetailState.getReservationType();
    }
  }
})();

/**
 * @author donghyun seo
 * @desc 등급선택
 *         (주의 : 해당 코드 내에는 영역에 대해서 block, zone, area 가 혼용되고 있어 주의가 필요,
 *         비지정석에 해당하는 zone 의 경우가 있을 수 있어 주의 필요)
 * @external tk.utils, tk.state.plan, tk.event.service, tk.event.view, tk.state.device, tk.event.service, tk.state.select, tk.state.view
 */
(function () {
  "use strict";

  angular
    .module("tklProject")
    .directive("tklSeatGradeSelect", function () {
      return {
        templateUrl: function () {
          var tkDeviceState = tk.state.device;
          var template = tkDeviceState.getTemplateOfDevice();
          return tk.utils.addQueryTime(
            "/resources/jsdev/reserve/seat/ui/component/seatGrade/seatGradeSelect" +
              template +
              ".html"
          );
        },
        transclude: true,
        replace: true,
        scope: {},
        bindToController: {},
        controller: TklSeatGradeSelectController,
        controllerAs: "select",
      };
    })
    .directive("tklSeatGrade", function () {
      return {
        templateUrl: function () {
          var tkDeviceState = tk.state.device;
          var template = tkDeviceState.getTemplateOfDevice();
          return tk.utils.addQueryTime(
            "/resources/jsdev/reserve/seat/ui/component/seatGrade/seatGrade" +
              template +
              ".html"
          );
        },
        transclude: true,
        replace: true,
        scope: {},
        bindToController: {
          depth: "<?",
          grade: "<?",
          color: "<?",
          name: "<?",
          price: "<?",
          remainCnt: "<?",
          zones: "<?",
          selected: "<?",
        },
        controller: TklSeatGradeController,
        controllerAs: "grade",
      };
    })
    .directive("tklZoneGrade", function () {
      return {
        templateUrl: function () {
          var tkDeviceState = tk.state.device;
          var template = tkDeviceState.getTemplateOfDevice();
          return tk.utils.addQueryTime(
            "/resources/jsdev/reserve/seat/ui/component/seatGrade/zoneGrade" +
              template +
              ".html"
          );
        },
        transclude: true,
        replace: true,
        scope: {},
        bindToController: {
          zone: "<?",
        },
        controller: TklZoneGradeController,
        controllerAs: "zone",
      };
    });

  TklSeatGradeSelectController.$inject = [
    "$scope",
    "$element",
    "$timeout",
    "$document",
    "$rootScope",
  ];

  /**
   * @description Debounce 처리 (일정 시간 내에 일어난 새로고침 등의 이벤트를 하나로 모아서 요청)
   */
  var _debounce = function (func, delay) {
    var time;
    return function () {
      var context = this;
      if (time) {
        clearTimeout(time);
      }

      time = setTimeout(function () {
        func.apply(context);
      }, delay);
    };
  };

  /**
   * @description 등급선택 전체 컨트롤러
   */
  function TklSeatGradeSelectController(
    $scope,
    $element,
    $timeout,
    $document,
    $rootScope
  ) {
    var ctrl = this;

    var tkPlanState = tk.state.plan;
    var tkDeviceState = tk.state.device;
    var tkSelectState = tk.state.select;
    var tkViewState = tk.state.view;
    var tkMetaState = tk.state.global.meta;

    $scope.frontPlanTypeCode = tkMetaState.frontPlanTypeCode;

    var selectSeatGradeElement = angular.element(
      $document[0].getElementById("select_seat_grade")
    )[0];
    var selectSeatZoneElement = angular.element(
      $document[0].getElementById("select_seat_zone")
    )[0];
    var reCalculateScrollTop = tkDeviceState.isPc() ? 30 : 70;

    ctrl.grades = tkPlanState.getGrades();
    ctrl.tooltipTop = 100;
    ctrl.showTooltip = false;
    ctrl.prevSelected = -1;
    ctrl.selectedList = [];
    ctrl.tooltipText = null;
    ctrl.showLoading = false;
    ctrl.isRemainExposure = tkPlanState.isRemainExposure;
    ctrl.isPriceExposure = tkPlanState.isPriceExposure;
    ctrl.selectedZoneId = null;
    ctrl.selectState = tkSelectState;

    ctrl.showTooltipAction = _showTooltipAction;
    ctrl.hideTooltipAction = _hideTooltipAction;
    ctrl.select = _select;
    ctrl.total = _total;

    ctrl.clearGradeAndBlock = _debounce(_clearGradeAndBlock, 500);
    ctrl.getNumberOverZero = tk.utils.getNumberOverZero;

    // 모바일 ------------------------------
    ctrl.zones = null;
    ctrl.zoneSelected = null;
    ctrl.mobileSelect = _mobileSelect;
    ctrl.zoneSelect = _zoneSelect;
    ctrl.viewState = tkViewState;
    tkViewState.seatInfo = $element;
    ctrl.isEmptyArray = tk.utils.isEmptyArray;
    ctrl.range = tk.utils.range;
    ctrl.isNeedEmptyGrade = _isNeedEmptyGrade;
    // -------------------------------------

    /* S: 취소표 대기 */
    ctrl.useGradeSelect = false;
    if (tk.utils.isWaitingReservation()) {
      ctrl.useGradeSelect = tk.state.waitingDetail.useGradeSelect;
    }
    /* E: 취소표 대기 */

    activate();

    function activate() {
      tk.event.service.signals.updatedReservationData.add(
        updatedReservationData
      );

      /**
       * @description 예매 정보 갱신
       */
      function updatedReservationData() {
        ctrl.grades = tkPlanState.getGrades();

        var selectedGrade = ctrl.selectState.selectedGrade;
        if (selectedGrade) {
          ctrl.zones = tkPlanState.getBlocksInGradeByGradeId(
            selectedGrade.gradeId
          );
          ctrl.grades = ctrl.grades.map(function (grade, index) {
            if (grade.gradeId === selectedGrade.gradeId) {
              var blocks = tkPlanState.getBlocksInGradeByGradeId(grade.gradeId);
              grade.zones = blocks;

              if (ctrl.prevSelected >= 0) {
                ctrl.selectedList[ctrl.prevSelected] = false;
              }
              ctrl.prevSelected = index;
            }
            return grade;
          });
          ctrl.viewState.isMobileZoneLayerOpen = getIsShowZones();
        }
        $scope.$evalAsync();
      }

      tk.event.service.signals.s2u_gradeLoadingToggle.add(
        s2u_gradeLoadingToggle
      );

      /**
       * @description 등급선택 로딩 처리
       * @param {Boolean} active 로딩 활성화 여부
       */
      function s2u_gradeLoadingToggle(active) {
        ctrl.showLoading = active;
        $scope.$evalAsync();
      }

      tk.event.ui.signals.gradeClear.add(gradeClear);

      /**
       * @description 등급선택 표시 초기화
       */
      function gradeClear() {
        if (tk.utils.isWaitingReservation()) {
          tkSelectState.setSelectedGrade(null);
          tkSelectState.setSelectedBlocks(
            tk.state.waitingDetail.getDefaultBlocks()
          );
        } else {
          if (ctrl.prevSelected >= 0) {
            ctrl.selectedList[ctrl.prevSelected] = false;
          }
          tkSelectState.setSelectedGrade(null);
          tkSelectState.setSelectedBlocks([]);
          tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);
        }
        $scope.$evalAsync();
      }

      tk.event.ui.signals.gradeMark.add(gradeMark);

      /**
       * @description 등급선택 표시
       * @param {Number} gradeId 표시할 등급 id
       */
      function gradeMark(gradeId) {
        if (!ctrl.grades || !Array.isArray(ctrl.grades)) {
          return;
        }

        _.each(ctrl.grades, function (grade, idx) {
          if (grade.gradeId === gradeId) {
            selectOnView(idx, grade);
          }
        });
        $scope.$evalAsync();
      }

      tk.event.ui.signals.zoneClear.add(zoneClear);

      /**
       * @description 등급선택 내 영역 초기화
       */
      function zoneClear() {
        if (!tkDeviceState.isMobile()) {
          return;
        }
        // 영역 클릭시 표시처리
        if (ctrl.zoneSelected) {
          ctrl.zoneSelected.toggleClass("select");
        }
        ctrl.zoneSelected = null;

        ctrl.viewState.isMobileZoneLayerOpen = getIsShowZones();

        //뷰 리사이즈 처리
        tk.event.view.signals.resizeView.dispatch();
        $scope.$evalAsync();
      }

      // PCWEB 의 경우, 스크롤이 발생시 tooltip 을 숨김
      if (tkDeviceState.isPc()) {
        var handleScroll = function () {
          ctrl.showTooltip = false;
          $scope.$evalAsync();
        };

        $element.on("DOMMouseScroll", handleScroll);
        $element.on("mousewheel", handleScroll);
      }

      // MOBILE 의 경우, 영역이 선택되어 있는 경우 선택 처리
      if (tkDeviceState.isMobile()) {
        tk.event.service.signals.s2u_updatedSelectedBlock.add(function () {
          $scope.$evalAsync();
        });

        $scope.$watch(
          function () {
            if (!tkSelectState.selectedBlock) {
              return 0;
            }
            return tkSelectState.selectedBlock.blockId;
          },
          function (blockId, oldBlockId) {
            if (ctrl.zoneSelected) {
              ctrl.zoneSelected.removeClass("select");
            } else if (oldBlockId > 0) {
              ctrl.oldZoneSelected = angular.element(
                $document[0].getElementById("block_" + oldBlockId)
              );
              ctrl.oldZoneSelected.removeClass("select");
            }

            if (blockId <= 0) {
              return;
            }

            ctrl.zoneSelected = angular.element(
              $document[0].getElementById("block_" + blockId)
            );
            ctrl.zoneSelected.addClass("select");
            reCalculateScrollByBlock(tkPlanState.blockMap[blockId]);
          }
        );
      }
    }

    /**
     * @description 등급 알림을 보임
     * @param {Object} evt 이벤트 객체
     * @param {Object} grade 등급
     */
    function _showTooltipAction(evt, grade) {
      if (!grade || !grade.notice) {
        return;
      }

      // 부모 창과 자식 창의 높이를 비교하여 툴팁의 위치를 함함
      var parent = evt.currentTarget.parentNode.getBoundingClientRect().top;
      var target = evt.currentTarget.getBoundingClientRect().top;
      ctrl.tooltipTop = target - parent + 30;

      ctrl.tooltipText = grade.notice;

      if (ctrl.tooltipTop < 0) {
        return;
      }
      ctrl.showTooltip = true;
    }

    /**
     * @description 등급 알림을 숨김
     */
    function _hideTooltipAction() {
      ctrl.tooltipText = null;
      ctrl.showTooltip = false;
    }

    /**
     * @description 등급 선택
     * @param {Object} evt 이벤트 객체
     * @param {Number} idx 해당 등급 인덱스
     * @param {Object} grade 등급
     */
    function _select(evt, idx, grade) {
      if (tk.utils.isWaitingReservation()) {
        if (tk.state.waitingDetail.useGradeSelect) {
          var enableGrades = tk.state.waitingDetail.gradeSelect;
          var hasGrade = enableGrades.some(function (currentGrade) {
            return grade.gradeId === currentGrade.gradeId;
          });
          if (hasGrade) {
            tk.state.waitingDetail.selectGrade(grade);
            $rootScope.$broadcast("reservationTypeRefresh");
          } else {
            alert("해당 등급은 취소표대기 신청 가능한 좌석이 없습니다.");
          }
          return;
        }
      }

      // 모바일에서 등급안내 영역을 클릭한 경우 -> 문제가 있어 롤백
      if (isTargetNoticeOnMobile(evt)) {
        return;
      }

      if (TLDomInfo.getInstance().areaCanvas.style.display === "block") {
        TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
      }

      // 선택한 등급으로 이동
      if (!tkDeviceState.isMobile()) {
        reCalculateScrollByGrade(grade);
      }

      // 이전에 선택한 좌석이 있으면 직접선택 타입으로 변경, 아닐 경우 타입 없음
      tkSelectState.selectedBlock = null;
      if (ctrl.prevSelected !== idx) {
        if (tkSelectState.hasSelectedSeats) {
          tkSelectState.setSelectedType(
            tkSelectState.SELECTED_TYPE.SELF_SELECT
          );
        } else {
          tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);
        }
      }

      // 이전에 선택한 등급이 있으면 파크 해제하고, 새로운 마크 설정
      if (ctrl.prevSelected >= 0) {
        ctrl.selectedList[ctrl.prevSelected] = false;
      }
      ctrl.selectedList[idx] = true;
      ctrl.prevSelected = idx;

      // 선택한 등급 설정
      tkSelectState.setSelectedGrade(grade);

      // 영역 초기화
      tk.event.ui.signals.zoneRefresh.dispatch();

      // 영역화면으로 이동
      if (tkPlanState.hasArea) {
        tk.event.view.signals.gotoAreaPlan.dispatch();
      }

      // 선택한 등급에 해당하는 영역 목록 조회
      var blocks = tkPlanState.getBlocksInGradeByGradeId(grade.gradeId);
      grade.zones = blocks;

      if (blocks && tkViewState.isViewOn()) {
        if (tk.utils.isWaitingReservation()) {
          tkSelectState.setSelectedBlocks(
            blocks.filter(function (block) {
              return block.remainCnt > 0;
            })
          ); // 등급 내 영역 목록 선택
        } else {
          // 부분 노출에서는 선택한 좌석 초기화
          if (tkPlanState.isPartExposure()) {
            tkSelectState.clearSelectedSeats();
          }

          tkSelectState.setSelectedBlocks(blocks); // 등급 내 영역 목록 선택
        }
      }

      // 모바일 ------------------------------
      if (tkDeviceState.isMobile()) {
        ctrl.zones = blocks;
        ctrl.selectedZoneList = [];
        ctrl.viewState.isMobileZoneLayerOpen = getIsShowZones();

        $timeout(function () {
          // 뷰 리사이즈
          tk.event.view.signals.resizeView.dispatch();

          // 블럭(영역) 리스트 scroll to top
          var parent = selectSeatZoneElement;
          $(parent).animate(
            {
              scrollTop: 0,
            },
            300
          );
        }, 60);
      }
      // -------------------------------------
    }

    /**
     * @description 모바일에서 등급안내 영역을 클릭한 경우 반환
     * @param {Object} evt 이벤트 객체
     * @return {Boolean} 모바일에서 등급안내 영역을 클릭한 경우
     */
    function isTargetNoticeOnMobile(evt) {
      if (evt === undefined) {
        // 이벤트가 없는 경우
        return false;
      }

      if (!tkDeviceState.isMobile()) {
        // 모바일이 아닌 경우
        return false;
      }
      var isNotANode = evt.target.nodeName !== "A"; // A 이면 등급, SPAN 이면 등급 안내
      var hasClassMarker = tk.utils.includes.call(
        evt.target.className,
        "notice_marker"
      ); // 등급 이름과 등급 안내 구분

      return isNotANode && hasClassMarker;
    }

    /**
     * @description 뷰에서 선택한 등급을 이벤트로 받아 표시
     * @param {Number} idx 해당 등급 인덱스
     * @param {Object} grade 등급
     */
    function selectOnView(idx, grade) {
      // 선택한 등급으로 이동
      reCalculateScrollByGrade(grade);

      // 이전에 선택한 등급이 있으면 파크 해제하고, 새로운 마크 설정
      if (ctrl.prevSelected >= 0) {
        ctrl.selectedList[ctrl.prevSelected] = false;
      }
      ctrl.selectedList[idx] = true;
      ctrl.prevSelected = idx;

      // 영역 초기화
      tk.event.ui.signals.zoneRefresh.dispatch();

      var blocks = tkPlanState.getBlocksInGradeByGradeId(grade.gradeId);
      grade.zones = blocks;

      // 모바일 ------------------------------
      if (tkDeviceState.isMobile()) {
        ctrl.zones = blocks;
        ctrl.selectedZoneList = [];
        ctrl.viewState.isMobileZoneLayerOpen = getIsShowZones();

        $timeout(function () {
          // 뷰 리사이즈
          tk.event.view.signals.resizeView.dispatch();
        }, 60);
      }
      // -------------------------------------
    }

    /**
     * @description 등급 선택시 스크롤 높이 조정(등급)
     * @param {Object} grade 등급
     */
    function reCalculateScrollByGrade(grade) {
      var parent = selectSeatGradeElement;
      var target = angular.element(
        $document[0].getElementById("seat_grade_" + grade.gradeId)
      )[0];
      reCalculateScroll(parent, target);
    }

    /**
     * @description 영역 선택시 스크롤 높이 조정(영역)
     * @param {Object} block 영역
     */
    function reCalculateScrollByBlock(block) {
      if (!tkDeviceState.isMobile()) {
        return;
      }

      if (!block) {
        return;
      }

      var parent = selectSeatZoneElement;
      var target = angular.element(
        $document[0].getElementById("seat_zone_" + block.blockId)
      )[0];

      if (!target) {
        $timeout(function () {
          target = angular.element(
            $document[0].getElementById("seat_zone_" + block.blockId)
          )[0];
          reCalculateScroll(parent, target);
        }, 100);
      }

      reCalculateScroll(parent, target);
    }

    /**
     * @description 등급 선택시 스크롤 높이 조정
     * @param {Object} parent 부모 요소
     * @param {Object} target 높이를 조정할 요소
     */
    function reCalculateScroll(parent, target) {
      if (!parent || !target) {
        return;
      }

      ctrl.tooltipText = null;
      ctrl.showTooltip = false;

      $timeout(function () {
        var top = target.offsetTop - reCalculateScrollTop;
        // var top = target.offsetTop - parent.clientHeight * 0.5; // 중앙

        $(parent).animate(
          {
            scrollTop: top,
          },
          300
        );
      }, 30);
    }

    /**
     * @description 등급선택 내 전체 클릭
     */
    function _total() {
      // [예매대기] 영역선택 안되기 위해 기능 block
      if (tk.utils.isWaitingReservation()) {
        return;
      }

      if (ctrl.prevSelected >= 0) {
        ctrl.selectedList[ctrl.prevSelected] = false;
      }

      // 선택한 등급, 영역, 선택유형 초기화
      tkSelectState.setSelectedGrade(null);
      tkSelectState.setSelectedBlocks([]);
      tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);

      if (tkViewState.isViewOn()) {
        // 선택 좌석 초기화로 인한
        if (tkPlanState.hasArea) {
          tk.event.view.signals.gotoAreaPlan.dispatch();
        }
      }

      // 부분노출의 경우 선택 좌석 초기화
      if (tkPlanState.isPartExposure()) {
        tkSelectState.clearSelectedSeats();
      }
    }

    /**
     * @description 전체 새로고침
     */
    function _clearGradeAndBlock() {
      $rootScope.$broadcast("refreshCount");

      tkSelectState.clearSelectedSeats();
      tk.event.service.signals.updateReservationSeatData.dispatch();
      tk.event.service.signals.updateReservationData.dispatch();
    }

    // 모바일 ------------------------------
    /**
     * @description 모바일 선택
     * @param {Object} evt 이벤트 객체
     * @param {Number} idx 해당 등급 인덱스
     * @param {Object} grade 등급
     */
    function _mobileSelect(evt, idx, grade) {
      _select(evt, idx, grade);
    }

    /**
     * @description 모바일 영역 선택
     * @param {Object} evt 이벤트 객체
     * @param {Number} idx 해당 영역 인덱스
     * @param {Object} block 영역
     */
    function _zoneSelect(evt, idx, block) {
      if (evt.hasOwnProperty("pointerType") && evt.pointerType === "mouse") {
        return;
      }

      if (evt.hasOwnProperty("stopPropagation")) {
        evt.stopPropagation();
      }

      // 영역 클릭시 표시처리
      if (ctrl.zoneSelected) {
        ctrl.zoneSelected.removeClass("select");
      }
      ctrl.zoneSelected = angular.element(evt.target.parentElement);
      ctrl.zoneSelected.addClass("select");

      // 도면이 있는 상품인 경우 영역으로 이동
      if (tkViewState.isViewOn()) {
        tkSelectState.setSelectedBlocks([block]);
        if (tkPlanState.isPartExposure()) {
          // 부분노출 영역 이동

          // 부분화면 비지정 클릭시
          var zone = tkPlanState.blockZoneMap[block.blockId];
          if (zone) {
            tkSelectState.selectedBlock = block;

            // 선택 좌석 초기화
            tkSelectState.clearSelectedSeats();

            var isSuccess = tkSelectState.selectZone(zone);
            if (!isSuccess) {
              return;
            }

            if (tk.utils.isWaitingReservation()) {
              tk.event.ui.signals.popupZone.dispatch(zone);
            } else {
              tk.event.ui.signals.popupPartZoneSelect.dispatch(zone);
            }
            return;
          }

          tkSelectState.selectBlock(block, tkPlanState, tkViewState);
          tkSelectState.clearSelectedSeats();
        } else {
          // 전체노출 영역 이동
          tkSelectState.selectBlock(block, tkPlanState, tkViewState);
        }
      }
    }

    /**
     * @description 영역목록을 볼 수 있는지 여부 반환
     * @return {Boolean} 영역목록을 볼 수 있는지 여부
     */
    function getIsShowZones() {
      if (ctrl.prevSelected < 0) {
        // 등급이 선택되었는지
        return false;
      }

      if (!tkPlanState.hasArea) {
        // 영역이 있는 도면인지
        return false;
      }

      if (tk.utils.isWaitingReservation()) {
        // 예매대기인 경우
        return true;
      }

      if (tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT) {
        // 직접선택만 있는 도면인지
        return true;
      }

      return (
        ctrl.selectState.selectedType ===
          ctrl.selectState.SELECTED_TYPE.SELF_SELECT && // 선택유형이 직접선택인지
        ctrl.zones.length > 0 && // 해당 등급에 영역이 존재하는지
        ctrl.selectState.isGradeSelected()
      ); // 선택 상태에서 등급이 선택되어 있는지
    }

    /**
     * @description 빈 영역이 필요한지 여부 반환
     * @return {Boolean} 빈 영역이 필요한지 여부
     */
    function _isNeedEmptyGrade() {
      if (!Array.isArray(ctrl.grades) || ctrl.grades.length > 2) {
        return false;
      }

      if (
        !Array.isArray(ctrl.zones) ||
        ctrl.grades.length >= ctrl.zones.length
      ) {
        return false;
      }

      return ctrl.viewState.isMobileZoneLayerOpen;
    }

    // ----------------------------------
  }

  TklSeatGradeController.$inject = ["$scope", "$timeout", "$document"];

  /**
   * @description 등급 컨트롤러
   */
  function TklSeatGradeController($scope, $timeout, $document) {
    var ctrl = this;

    var tkPlanState = tk.state.plan;
    var tkSelectState = tk.state.select;
    var tkViewState = tk.state.view;
    var tkDeviceState = tk.state.device;

    var selectSeatGradeElement = angular.element(
      $document[0].getElementById("select_seat_grade")
    )[0];

    ctrl.prevSelected = -1;

    ctrl.blockMap = tkPlanState.blockMap;
    ctrl.isRemainExposure = tkPlanState.isRemainExposure;
    ctrl.isPriceExposure = tkPlanState.isPriceExposure;
    ctrl.selectedList = [];
    ctrl.isZoneSelected = false;
    ctrl.selectState = tkSelectState;

    ctrl.isShowBtn = _isShowBtn;
    ctrl.isShowZones = _isShowZones;
    ctrl.select = _select;
    ctrl.btnClick = _btnClick;
    ctrl.showGradeNotice = _showGradeNotice;
    ctrl.getNumberOverZero = tk.utils.getNumberOverZero;

    if (tk.utils.isWaitingReservation()) {
      var tkWaitingDetailState = tk.state.waitingDetail;
      ctrl.isRemainExposure = tkWaitingDetailState.showAvailableCountExposure();
    }

    activate();

    function activate() {
      tk.event.ui.signals.zoneRefresh.add(zoneRefresh);

      /**
       * @description 영역 표시 초기화
       */
      function zoneRefresh() {
        if (ctrl.prevSelected >= 0) {
          ctrl.selectedList[ctrl.prevSelected] = false;
          ctrl.isZoneSelected = false;
          ctrl.prevSelected = -1;
        }
        $scope.$evalAsync();
      }

      tk.event.ui.signals.zoneClear.add(zoneClear);

      /**
       * @description 등급선택 내 영역 초기화
       */
      function zoneClear() {
        if (!tkDeviceState.isPc()) {
          return;
        }
        zoneRefresh();
        $scope.$evalAsync();
      }

      // 등급이 새로 선택되면 이전 선택된 영역 초기화
      $scope.$watch("grade.selected", function (selected) {
        if (!selected && ctrl.prevSelected >= 0) {
          if (ctrl.prevSelected >= 0) {
            ctrl.selectedList[ctrl.prevSelected] = false;
            ctrl.isZoneSelected = false;
            ctrl.prevSelected = -1;
          }
        }
      });

      // 새로 선택된 영역을 표시해 주는 처리
      $scope.$watch(
        function () {
          if (!tkSelectState.selectedBlock) {
            return 0;
          }
          return tkSelectState.selectedBlock.blockId;
        },
        function (blockId) {
          if (!tkSelectState.selectedBlock) {
            return;
          }

          if (!ctrl.zones || !Array.isArray(ctrl.zones)) {
            return;
          }

          _.each(ctrl.zones, function (zone, idx) {
            if (ctrl.selectedList[idx]) {
              ctrl.selectedList[idx] = false;
            }

            if (zone.blockId === blockId) {
              if (ctrl.prevSelected >= 0) {
                ctrl.selectedList[ctrl.prevSelected] = false;
              }
              ctrl.selectedList[idx] = true;
              ctrl.isZoneSelected = true;
              ctrl.prevSelected = idx;

              // 선택한 영역으로 이동
              // reCalculateScrollByBlock(zone);
            }
          });
        }
      );

      // 새로고침 시 이미 선택되어 있는 등급에 영역이 없을 경우 처리
      if (isNeedToZone()) {
        ctrl.zones = tkPlanState.getBlocksInGradeByGradeId(ctrl.grade.gradeId);
      }

      /**
       * @description 새로고침 시 이미 선택되어 있는 등급에 영역이 없을 경우 처리
       */
      function isNeedToZone() {
        if (ctrl.depth !== 1) {
          // 등급이 아닌 경우 통과, 1 : 등급, 2 : 영역
          return false;
        }

        if (!ctrl.selected) {
          // 선택되지 않았으면 통과
          return false;
        }

        if (!tkSelectState.selectedGrade || !ctrl.grade) {
          // 선택된 등급이나 등급이 없으면 통과
          return false;
        }

        // 선택된 등급과 등급이 일치하는지 여부
        return tkSelectState.selectedGrade.gradeId === ctrl.grade.gradeId;
      }
    }

    /**
     * @description 선택유형 버튼이 보여야 하는지 여부 반환
     * @return {Boolean} 선택유형 버튼이 보여야 하는지 여부
     */
    function _isShowBtn() {
      if (tk.utils.isWaitingReservation()) {
        // 예매대기인 경우
        return false;
      }

      if (!ctrl.grade) {
        // 등급 여부
        return false;
      }

      if (ctrl.depth !== 1) {
        // 깊이가 1 여부
        return false;
      }

      if (!ctrl.selected) {
        // 등급 선택 여부
        return false;
      }

      if (
        ctrl.selectState.selectedType !== ctrl.selectState.SELECTED_TYPE.NONE
      ) {
        // 선택 타입이 없음으로 설정 여부
        return false;
      }

      var isSelectTypeDirect =
        tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT; // 직접 선택 여부
      if (isSelectTypeDirect) {
        return false;
      }

      return ctrl.grade.auto || ctrl.grade.direct; // 해당 등급의 자동 배정, 직접 선택 여부
    }

    /**
     * @description 영역목록을 볼 수 있는지 여부 반환
     * @return {Boolean} 영역목록을 볼 수 있는지 여부
     */
    function _isShowZones() {
      if (ctrl.isShowBtn()) {
        // 선택 버튼이 올라와있는지 여부
        return false;
      }

      if (!ctrl.selected) {
        // 등급 선택 여부
        return false;
      }

      if (
        ctrl.selectState.selectedType ===
        ctrl.selectState.SELECTED_TYPE.AUTO_SELECT
      ) {
        // 선택 타입이 자동으로 설정 여부
        return false;
      }

      return Array.isArray(ctrl.zones) && ctrl.zones.length > 0; // 하위 구역 존재 여부
    }

    /**
     * @description 영역 선택
     * @param {Number} idx 해당 영역 인덱스
     * @param {Object} block 영역
     */
    function _select(evt, idx, block) {
      evt.stopPropagation();

      if (tk.utils.isWaitingReservation()) {
        if (block.remainCnt === 0) {
          alert("해당 구역은 취소표대기 신청 가능한 좌석이 없습니다.");
          return;
        }
      }

      if (TLDomInfo.getInstance().areaCanvas.style.display === "block") {
        TLSVGMatrixInfo.getInstance().saveScaleAndPosition();
      }

      // 선택한 영역으로 이동
      // reCalculateScrollByEvent(evt);

      // 영역 클릭시 표시처리
      if (ctrl.prevSelected >= 0) {
        ctrl.selectedList[ctrl.prevSelected] = false;
      }
      ctrl.selectedList[idx] = true;
      ctrl.isZoneSelected = true;
      ctrl.prevSelected = idx;

      // 도면이 있는 상품인 경우 영역으로 이동
      if (tkViewState.isViewOn()) {
        tkSelectState.setSelectedBlocks([block]);
        if (tkPlanState.isPartExposure()) {
          // 부분노출 영역 이동

          // 부분화면 비지정 클릭시
          var zone = tkPlanState.blockZoneMap[block.blockId];
          if (zone) {
            if (tk.utils.isWaitingReservation()) {
              var isSuccess = tkSelectState.selectZone(zone);
              if (!isSuccess) {
                return;
              }

              tk.event.ui.signals.popupZone.dispatch(zone);
              return;
            }
            tkSelectState.selectedBlock = block;

            // 선택 좌석 초기화
            tkSelectState.clearSelectedSeats();

            var isSuccess = tkSelectState.selectZone(zone);
            if (!isSuccess) {
              return;
            }

            tk.event.ui.signals.popupPartZoneSelect.dispatch(zone);
            return;
          }

          tkSelectState.selectBlock(block, tkPlanState, tkViewState);
          tkSelectState.clearSelectedSeats();
        } else {
          // 전체노출 영역 이동
          tkSelectState.selectBlock(block, tkPlanState, tkViewState);
        }
      }
    }

    /**
     * @description 선택유형 선택
     * @param {Number} type 선택유형 타입
     * @param {Object} grade 등급
     */
    function _btnClick(type, grade) {
      // 선예매 등급인 경우
      if (!tkSelectState.isPreReserveSaleValidate(grade.gradeId)) {
        // 등급 초기화가 이루어지지 않는 문제가 있어서 timeout으로 처리
        $timeout(function () {
          tk.event.ui.signals.gradeClear.dispatch();
        });
        return false;
      }

      // 등급 동의를 하지 않은 경우
      if (!tkSelectState.isGradeAgreeValidate(grade.gradeId)) {
        return false;
      }

      tkSelectState.setSelectedType(type);
      tkSelectState.setSelectedGrade(grade);
      if (type === ctrl.selectState.SELECTED_TYPE.AUTO_SELECT) {
        tk.event.ui.signals.popupAutoSelect.dispatch(grade);
      }
    }

    /**
     * @description 영역 선택시 스크롤 높이 조정(이벤트)
     * @param {Object} evt 이벤트 객체
     */
    function reCalculateScrollByEvent(evt) {
      if (!tkDeviceState.isPc()) {
        return;
      }

      var parent = selectSeatGradeElement;
      var target = angular.element(evt.currentTarget)[0];
      reCalculateScroll(parent, target);
    }

    /**
     * @description 영역 선택시 스크롤 높이 조정(영역)
     * @param {Object} block 영역
     */
    function reCalculateScrollByBlock(block) {
      if (!tkDeviceState.isPc()) {
        return;
      }

      var parent = selectSeatGradeElement;
      var target = angular.element(
        $document[0].getElementById("seat_zone_" + block.blockId)
      )[0];
      reCalculateScroll(parent, target);
    }

    /**
     * @description 등급 선택시 스크롤 높이 조정
     * @param {Object} parent 부모 요소
     * @param {Object} target 높이를 조정할 요소
     */
    function reCalculateScroll(parent, target) {
      if (!tkDeviceState.isPc()) {
        return;
      }

      if (!parent || !target) {
        return;
      }

      ctrl.tooltipText = null;
      ctrl.showTooltip = false;

      $timeout(function () {
        var top =
          target.offsetTop +
          target.parentNode.parentNode.offsetTop -
          parent.clientHeight * 0.5;
        // parent.scrollTop = top;
        $(parent).animate(
          {
            scrollTop: top,
          },
          300
        );
      }, 90);
    }

    // 모바일 ------------------------------
    /**
     * @description 등급 알림 선택
     * @param {Object} evt 이벤트 객체
     * @param {Object} grade 등급
     */
    function _showGradeNotice(evt, grade) {
      if (evt.hasOwnProperty("stopPropagation")) {
        evt.stopPropagation();
      }
      alert(grade.notice);
    }

    // -------------------------------------
  }

  TklZoneGradeController.$inject = [];

  /**
   * @description 영역 컨트롤러
   */
  function TklZoneGradeController() {
    var ctrl = this;

    var tkPlanState = tk.state.plan;
    var tkSelectState = tk.state.select;

    ctrl.selectState = tkSelectState;
    ctrl.isRemainExposure = tkPlanState.isRemainExposure;
    ctrl.isPriceExposure = tkPlanState.isPriceExposure;
    ctrl.blockMap = tkPlanState.blockMap;
    ctrl.getNumberOverZero = tk.utils.getNumberOverZero;
  }
})();

/**
 * @author donghyun seo
 * @desc 선택 유형(좌석 선택)
 * @external tk.utils, tk.state.plan, tk.state.device, tk.state.select
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('tklSeatSelect', function () {
			return {
				templateUrl: function () {
					var tkDeviceState = tk.state.device;
					var template = tkDeviceState.getTemplateOfDevice();
					return tk.utils.addQueryTime('/resources/jsdev/reserve/seat/ui/component/seatSelect/seatSelect' + template + '.html');
				},
				transclude: true,
				replace: true,
				scope: {},
				bindToController: {},
				controller: TklSeatSelectController,
				controllerAs: 'select'
			}
		});

	TklSeatSelectController.$inject = ['$document', '$scope'];

	/**
	 * @description 선택유형 컨트롤러
	 */
	function TklSeatSelectController ($document, $scope) {
		var ctrl = this;

		var tkPlanState = tk.state.plan;
		var tkSelectState = tk.state.select;
		var tkViewState = tk.state.view;

		ctrl.seatSelect = undefined;
		ctrl.selectState = tkSelectState;
		ctrl.showNotice = false;
		ctrl.hasReserveCommissionContent = !!tkPlanState.reserveCommissionContent;

		ctrl.selectTypeClick = _selectTypeClick;
		ctrl.isAutoDisabled = _isAutoDisabled;
		ctrl.isSelfDisabled = _isSelfDisabled;
		ctrl.isBtnShow = _isBtnShow;
		ctrl.isAutoShow = _isAutoShow;
		ctrl.isSelfShow = _isSelfShow;

		ctrl.isOnlyAutoAssignment = tkPlanState.isOnlyAutoAssignment;

		activate();

		function activate () {
			// 좌석선점 및 자동배정 안내를 위한 처리
			var detailInfo = angular.element($document[0].getElementById('detail_info'));
			detailInfo.append(angular.element('<div>' + tkPlanState.reserveCommissionContent + '</div>'));
		}

		/**
		 * @description 좌석 선택 버튼이 보여야 하는지 여부 반환
		 * @return {Boolean} 좌석 선택 버튼이 보여야 하는지 여부
		 */
		function _isBtnShow () {
			var isGradeSelected = ctrl.selectState.isGradeSelected(); // 등급이 선택되어 있는지
			var isSelectedTypeNone = ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.NONE; // 선택 유형이 없음이 아닌지
			var isDirectType = tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT; // 직접선택만 있는지
			return isGradeSelected && !isSelectedTypeNone && !isDirectType;
		}

		/**
		 * @description 선택유형 선택
		 * @param {Number} type 선택유형 타입
		 */
		function _selectTypeClick (type) {
			if (isDisabled()) {
				return;
			}

			// 선예매 등급인 경우
			if (!tkSelectState.isPreReserveSaleValidate(tkSelectState.selectedGrade.gradeId)) {
				tk.event.ui.signals.gradeClear.dispatch();
				return false;
			}

			// 등급 동의를 하지 않은 경우
			if (!tkSelectState.isGradeAgreeValidate(tkSelectState.selectedGrade.gradeId)) {
				return false;
			}

			// 이미 자동배정이 선택되어 있는데 자동배정을 선택하였을 때
			if (type === ctrl.selectState.SELECTED_TYPE.AUTO_SELECT && !ctrl.selectState.selectedGrade.auto) {
				return;
			}

			// 이미 직접선택이 선택되어 있는데 직접선택을 선택하였을 때
			if (type === ctrl.selectState.SELECTED_TYPE.SELF_SELECT && !ctrl.selectState.selectedGrade.direct) {
				return;
			}

			// 선택유형 선택
			ctrl.seatSelect = type;
			tkSelectState.setSelectedType(type);

			// 모바일 ---------------------------------------------------
			// 직접선택 유형 선택시 등급선택 레이어 접힘 
			if (type === ctrl.selectState.SELECTED_TYPE.SELF_SELECT) {
				tkViewState.isMobileZoneLayerOpen = true;
			} else {
				tkViewState.isMobileZoneLayerOpen = false;
			}
			// ---------------------------------------------------------

			// 자동배정 유형 선택시 팝업
			if (ctrl.selectState.selectedGrade && type === ctrl.selectState.SELECTED_TYPE.AUTO_SELECT) {
				tk.event.ui.signals.popupAutoSelect.dispatch(ctrl.selectState.selectedGrade);

			}
			var grade = tk.state.select.selectedGrade;
			var blocks = tkPlanState.getBlocksInGradeByGradeId(grade.gradeId);
			tkSelectState.setSelectedBlocks(blocks); // 영역들 선택
		}

		/**
		 * @description 자동배정 비활성화 여부 반환
		 * @return {Boolean} 자동배정 비활성화 여부
		 */
		function _isAutoDisabled () {
			if (ctrl.selectState.selectedGrade && !ctrl.selectState.selectedGrade.auto) {
				return true;
			}
			return isDisabled();
		}

		/**
		 * @description 직접선택 비활성화 여부 반환
		 * @return {Boolean} 직접선택 비활성화 여부
		 */
		function _isSelfDisabled () {
			if (ctrl.selectState.selectedGrade && !ctrl.selectState.selectedGrade.direct) {
				return true;
			}
			return isDisabled();
		}

		/**
		 * @description 선택유형이 설정되있지 않은 경우 비활성화 여부 반환
		 * @return {Boolean} 선택유형이 설정되있지 않은 경우 비활성화 여
		 */
		function isDisabled () {
			return ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.NONE && !ctrl.selectState.selectedGrade
		}

		// 모바일 --------------------------------------------------
		/**
		 * @description 자동배정 버튼 보일지 여부 반환
		 * @return {Boolean} 자동배정 버튼 보일지 여부
		 */
		function _isAutoShow () {
			var isDirectProduct = tkPlanState.selectType === tkPlanState.SELECT_TYPE.DIRECT; // 직접선택만 있는 경우
			var isSelectedTypeSelf = ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.SELF_SELECT; // 직접선택을 선택한 경우
			return !isDirectProduct && !isSelectedTypeSelf && !ctrl.selectState.hasSelectedSeats;
		}

		/**
		 * @description 직접선택 버튼 보일지 여부 반환
		 * @return {Boolean} 직접선택 버튼 보일지 여부
		 */
		function _isSelfShow () {
			var isAutoProduct = tkPlanState.selectType === tkPlanState.SELECT_TYPE.AUTO; // 자동배정만 있는 경우
			var isSelectedTypeSelf = ctrl.selectState.selectedType === ctrl.selectState.SELECTED_TYPE.SELF_SELECT; // 직접선택을 선택한 경우
			return !isAutoProduct && !isSelectedTypeSelf;
		}

		// ----------------------------------------------------------
	}
})();

/**
 * @author donghyun seo
 * @desc 자동배정 팝업
 * @external tk.utils, tk.state.plan, tk.state.device, tk.state.select, tk.state.view, tk.utils
 */
(function () {
  "use strict";

  angular.module("tklProject").directive("tklPopupAutoSeatSelect", function () {
    return {
      templateUrl: function () {
        var tkDeviceState = tk.state.device;
        var template = tkDeviceState.getTemplateOfDevice();
        return tk.utils.addQueryTime(
          "/resources/jsdev/reserve/seat/ui/component/popup/popupAutoSeatSelect" +
            template +
            ".html"
        );
      },
      transclude: true,
      replace: true,
      scope: {},
      bindToController: {},
      controller: TklPopupAutoSeatSelectController,
      controllerAs: "popup",
    };
  });

  TklPopupAutoSeatSelectController.$inject = ["$scope"];

  /**
   * @description 자동배정 팝업 컨트롤러
   */
  function TklPopupAutoSeatSelectController($scope) {
    var ctrl = this;

    var tkPlanState = tk.state.plan;
    var tkSelectState = tk.state.select;
    var tkViewState = tk.state.view;

    ctrl.display = false;
    ctrl.isBtnShow = false;
    ctrl.isRemainExposure = tkPlanState.isRemainExposure;
    ctrl.isPriceExposure = tkPlanState.isPriceExposure;
    ctrl.grade = undefined;
    ctrl.increaseInterval = 1;
    ctrl.selectState = tkSelectState;

    ctrl.close = _close;
    ctrl.increaseBtnClick = _increaseBtnClick;
    ctrl.setBtnClick = _setBtnClick;
    ctrl.next = _next;
    ctrl.isDisable = _isDisable;
    ctrl.range = tk.utils.range;
    ctrl.getNumberOverZero = tk.utils.getNumberOverZero;

    activate();

    function activate() {
      tk.event.ui.signals.popupAutoSelect.add(popupAutoSelect);

      /**
       * @description 자동배정 팝업
       * @param {Object} grade 등급
       */
      function popupAutoSelect(grade) {
        ctrl.display = true;
        ctrl.isBtnShow = false;
        ctrl.grade = grade;
        ctrl.gradeRemainCnt = tkPlanState.gradeMap[grade.gradeId].remainCnt;
        ctrl.increaseInterval =
          grade.groupSeatCount < 1 ? 1 : grade.groupSeatCount;

        // 영역화면으로 이동
        // tk.event.view.signals.gotoAreaPlan.dispatch("NONE");

        tk.event.ui.signals.gradeMark.dispatch(grade.gradeId);
        tk.event.ui.signals.dimmedOn.dispatch();
        $scope.$evalAsync();
      }

      tk.event.ui.signals.popupCloseAll.add(popupCloseAll);

      /**
       * @description 전체 팝업 종료
       */
      function popupCloseAll() {
        tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);
        _close();
        $scope.$evalAsync();
      }
    }

    /**
     * @description 팝업 종료
     */
    function _close() {
      if (!ctrl.display) {
        return;
      }

      tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);
      // tkSelectState.setSelectedBlocks([]);

      ctrl.display = false;
      ctrl.selectState.autoSelectCount = 0;
      tk.event.ui.signals.dimmedOff.dispatch();
    }

    /**
     * @description 증가, 감소 버튼 클릭
     * @param {Number} value 값
     */
    function _increaseBtnClick(value) {
      if (value < 0 && ctrl.selectState.autoSelectCount < 1) {
        ctrl.selectState.autoSelectCount = 0;
        return;
      }
      tkSelectState.updateAutoSelectCount(
        ctrl.grade,
        ctrl.selectState.autoSelectCount + value
      );
    }

    /**
     * @description 셀렉트 버튼 클릭
     * @param {Number} value 값
     */
    function _setBtnClick(value) {
      if (value < 0) {
        ctrl.selectState.autoSelectCount = 0;
        return;
      }
      tkSelectState.updateAutoSelectCount(ctrl.grade, value);
      ctrl.isBtnShow = false;
    }

    /**
     * @description 다음단계
     */
    function _next() {
      if (ctrl.gradeRemainCnt > 0) {
        if (ctrl.selectState.autoSelectCount > 0) {
          tkViewState.nextStep(true);
          return;
        }
        alert(tk.i18n.translate.getTranslate("PLEASE_SELECT_QTY"));
      }
    }

    /**
     * @description disabled 처리
     */
    function _isDisable() {
      return ctrl.isBtnShow;
    }

    tk.event.ui.signals.updatePopupData.add(updateGradeData);

    function updateGradeData(grade) {
      ctrl.gradeRemainCnt = grade.remainCnt;
      $scope.$evalAsync();
    }
  }
})();

/**
 * @author donghyun seo
 * @desc 전체노출 비지정석 선택 팝업
 * @external tk.utils, tk.state.plan, tk.state.device, tk.state.select, tk.utils
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('tklPopupZoneSelect', function () {
			return {
				templateUrl: function () {
					var tkDeviceState = tk.state.device;
					var template = tkDeviceState.getTemplateOfDevice();
					var isWaitingMode = tk.utils.isWaitingReservation();

					var templateBaseURL = '/resources/jsdev/reserve/seat/ui/component/popup/popupZoneSelect';
					if (isWaitingMode) {
						templateBaseURL += 'Waiting';
					} else {
						templateBaseURL += template;
					}

					return tk.utils.addQueryTime(templateBaseURL + '.html');
				},
				transclude: true,
				replace: true,
				scope: {},
				bindToController: {},
				controller: TklPopupZoneSelectController,
				controllerAs: 'popup'
			}
		});

	TklPopupZoneSelectController.$inject = ['$scope'];

	/**
	 * @description 전체노출 비지정석 선택 팝업 컨트롤러
	 */
	function TklPopupZoneSelectController ($scope) {
		var ctrl = this;

		var originCount = 0;

		var tkPlanState = tk.state.plan;
		var tkSelectState = tk.state.select;
		var tkWaitingDetailState = tk.state.waitingDetail;

		ctrl.zone = undefined;
		ctrl.grade = undefined;
		ctrl.increaseInterval = 1;
		ctrl.zoneCount = 0;
		ctrl.zoneRemainCnt = 0;
		ctrl.display = false;
		ctrl.isBtnShow = false;
		ctrl.isEnterShow = true;
		ctrl.isRemainExposure = tkPlanState.isRemainExposure;
		ctrl.selectState = tkSelectState;
		ctrl.isWaitingMode = tk.utils.isWaitingReservation();

		ctrl.close = _close;
		ctrl.enter = _enter;
		ctrl.reset = _reset;
		ctrl.increaseBtnClick = _increaseBtnClick;
		ctrl.setBtnClick = _setBtnClick;
		ctrl.isDisable = _isDisable;
		ctrl.range = tk.utils.range;
		ctrl.getNumberOverZero = tk.utils.getNumberOverZero;
		ctrl.isSoldOut = _isSoldOut;

		activate();

		function activate () {
			tk.event.ui.signals.popupZone.add(popupZone);

			/**
			 * @description 전체노출 비지정석 선택 팝업
			 * @param {Object} zone 비지정석
			 */
			function popupZone (zone) {
				ctrl.display = true;
				ctrl.isBtnShow = false;
				ctrl.zone = zone;
				ctrl.grade = tkPlanState.gradeMap[zone.gradeId];
				if (ctrl.isWaitingMode) {
					ctrl.increaseInterval = tkWaitingDetailState.currentTicketCount;
					originCount = tkWaitingDetailState.currentTicketCount;
					ctrl.zoneCount = tkWaitingDetailState.currentTicketCount;
					ctrl.zoneRemainCnt = tkWaitingDetailState.currentTicketCount;
					ctrl.zone.count = tkWaitingDetailState.currentTicketCount;
				} else {
					ctrl.increaseInterval = ctrl.grade.groupSeatCount < 1 ? 1 : ctrl.grade.groupSeatCount;
					originCount = zone.count;
					ctrl.zoneCount = zone.count;
					ctrl.zoneRemainCnt = tkPlanState.zoneSoldMap[zone.logicalZoneId];
				}

				ctrl.isEnterShow = originCount <= 0;
				tk.event.ui.signals.dimmedOn.dispatch();
				$scope.$evalAsync();
			}

			tk.event.ui.signals.popupCloseAll.add(popupCloseAll);

			/**
			 * @description 전체 팝업 종료
			 */
			function popupCloseAll () {
				_close();
				$scope.$evalAsync();
			}
		}

		/**
		 * @description 팝업 종료
		 */
		function _close () {
			if (!ctrl.display) {
				return;
			}

			ctrl.display = false;
			if (ctrl.zone) {
				tkSelectState.updateZoneCount(ctrl.zone, originCount);
				checkLessThanOne();
			}
			tk.event.ui.signals.dimmedOff.dispatch();
		}

		/**
		 * @description 확인 버튼
		 */
		function _enter () {
			ctrl.display = false;
			if (ctrl.isWaitingMode) {
				if (ctrl.zone) {
					tkSelectState.updateZoneCount(ctrl.zone, ctrl.zoneCount);
				}
			}
			checkLessThanOne();
			tk.event.ui.signals.dimmedOff.dispatch();
		}

		/**
		 * @description 초기화 버튼
		 */
		function _reset () {
			ctrl.display = false;
			tkSelectState.updateZoneCount(ctrl.zone, 0);
			checkLessThanOne();
			tk.event.ui.signals.dimmedOff.dispatch();
		}

		/**
		 * @description 비지정석 매수가 1보다 적은지 확인
		 */
		function checkLessThanOne () {
			tkSelectState.checkZoneLessThanOne(ctrl.zone);
		}

		/**
		 * @description 증가, 감소 버튼 클릭
		 * @param {Number} value 값
		 */
		function _increaseBtnClick (value) {
			if (value < 0 && ctrl.zone.count < 1) {
				return;
			}
			if (value > 0 && (value + ctrl.zone.count) > ctrl.zoneRemainCnt) {
				return;
			}

			tkSelectState.updateZoneCount(ctrl.zone, ctrl.zone.count + value);
			ctrl.zoneCount = ctrl.zone.count;
		}

		/**
		 * @description 셀렉트 버튼 클릭
		 * @param {Number} value 값
		 */
		function _setBtnClick (value) {
			if (value < 0) {
				return;
			}

			tkSelectState.updateZoneCount(ctrl.zone, value);
			ctrl.zoneCount = ctrl.zone.count;
			ctrl.isBtnShow = false;
		}

		/**
		 * @description disabled 처리
		 */
		function _isDisable () {
			return ctrl.isBtnShow;
		}

		function _isSoldOut () {
			if (ctrl.selectState.getZoneSelectCount(ctrl.zone) === 0 && ctrl.zoneRemainCnt <= 0) {
				return true;
			}
			false;
		}

	}
})();

/**
 * @author donghyun seo
 * @desc 부분노출 비지정석 선택 팝업
 * @external tk.utils, tk.state.plan, tk.state.device, tk.state.select, tk.state.view
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('tklPopupPartZoneSelect', function () {
			return {
				templateUrl: function () {
					var tkDeviceState = tk.state.device;
					var template = tkDeviceState.getTemplateOfDevice();
					return tk.utils.addQueryTime('/resources/jsdev/reserve/seat/ui/component/popup/popupPartZoneSelect' + template + '.html');
				},
				transclude: true,
				replace: true,
				scope: {},
				bindToController: {},
				controller: TklPopupPartZoneSelectController,
				controllerAs: 'popup'
			}
		});

	TklPopupPartZoneSelectController.$inject = ['$scope'];
	/**
	 * @description 부분노출 비지정석 선택 팝업 컨트롤러
	 */
	function TklPopupPartZoneSelectController ($scope) {
		var ctrl = this;
		var originCount = 0;

		var tkPlanState = tk.state.plan;
		var tkSelectState = tk.state.select;
		var tkViewState = tk.state.view;

		ctrl.display = false;
		ctrl.isBtnShow = false;
		ctrl.isRemainExposure = tkPlanState.isRemainExposure;
		ctrl.zone = undefined;
		ctrl.grade = undefined;
		ctrl.increaseInterval = 1;
		ctrl.zoneCount = 0;
		ctrl.zoneRemainCnt = 0;
		ctrl.selectState = tkSelectState;

		ctrl.close = _close;
		ctrl.increaseBtnClick = _increaseBtnClick;
		ctrl.setBtnClick = _setBtnClick;
		ctrl.next = _next;
		ctrl.isDisable = _isDisable;
		ctrl.range = tk.utils.range;
		ctrl.getNumberOverZero = tk.utils.getNumberOverZero;

		activate();

		function activate () {
			tk.event.ui.signals.popupPartZoneSelect.add(popupPartZoneSelect);
			/**
			 * @description 부분노출 비지정석 선택 팝업
			 * @param {Object} zone 비지정석
			 */
			function popupPartZoneSelect (zone) {
				ctrl.display = true;
				ctrl.isBtnShow = false;
				ctrl.zone = zone;
				ctrl.grade = tkPlanState.gradeMap[zone.gradeId];
				ctrl.increaseInterval = ctrl.grade.groupSeatCount < 1 ? 1 : ctrl.grade.groupSeatCount;
				originCount = zone.count;
				ctrl.zoneCount = zone.count;
				ctrl.zoneRemainCnt = tkPlanState.zoneSoldMap[zone.logicalZoneId];

				// 영역화면으로 이동
				tk.event.view.signals.gotoAreaPlan.dispatch();

				tk.event.ui.signals.gradeMark.dispatch(zone.gradeId);
				tk.event.ui.signals.dimmedOn.dispatch();
				$scope.$evalAsync();
			}

			tk.event.ui.signals.popupCloseAll.add(popupCloseAll);
			/**
			 * @description 전체 팝업 종료
			 */
			function popupCloseAll () {
				_close();
				$scope.$evalAsync();
			}
		}

		/**
		 * @description 팝업 종료
		 */
		function _close () {
			if (!ctrl.display) {
				return;
			}
			
			ctrl.display = false;
			if (ctrl.zone) {
				tkSelectState.setSelectedType(tkSelectState.SELECTED_TYPE.NONE);
				tkSelectState.setSelectedBlocks([]);

				tkSelectState.updateZoneCount(ctrl.zone, 0);
				checkLessThanOne();
				tk.event.ui.signals.zoneClear.dispatch();
				tk.event.ui.signals.gradeClear.dispatch();
			}
			tk.event.ui.signals.dimmedOff.dispatch();
		}

		/**
		 * @description 비지정석 매수가 1보다 적은지 확인
		 */
		function checkLessThanOne () {
			tkSelectState.checkZoneLessThanOne(ctrl.zone);
		}

		/**
		 * @description 증가, 감소 버튼 클릭
		 * @param {Number} value 값
		 */
		function _increaseBtnClick (value) {
			if (value < 0 && ctrl.zone.count < 1) {
				return;
			}
			if (value > 0 && (value + ctrl.zone.count) > ctrl.zoneRemainCnt) {
				return;
			}
			tkSelectState.updateZoneCount(ctrl.zone, ctrl.zone.count + value);
			ctrl.zoneCount = ctrl.zone.count;
		}

		/**
		 * @description 셀렉트 버튼 클릭
		 * @param {Number} value 값
		 */
		function _setBtnClick (value) {
			if (value < 0) {
				return;
			}

			tkSelectState.updateZoneCount(ctrl.zone, value);
			ctrl.zoneCount = ctrl.zone.count;
			ctrl.isBtnShow = false;
		}

		/**
		 * @description 다음단계
		 */
		function _next () {
			tkViewState.nextStep();
		}

		/**
		 * @description disabled 처리
		 */
		function _isDisable () {
			return ctrl.isBtnShow;
		}
	}
})();

/**
 * @author myungjae jang
 * @desc 캡차 팝업
 // * @external tk.state.view
 */
(function () {
  "use strict";

  const TKL_MK_CAP_SESS = "TKL_MK_CAP_SESS";

  angular.module("tklProject").directive("tklPopupCaptcha", function () {
    return {
      templateUrl: function () {
        var tkDeviceState = tk.state.device;
        var template = tkDeviceState.getTemplateOfDevice();
        return tk.utils.addQueryTime(
          "/resources/jsdev/reserve/seat/ui/component/popup/popupCaptcha" +
            template +
            ".html"
        );
      },
      transclude: true,
      replace: true,
      scope: {},
      bindToController: {},
      controller: TklPopupCaptchaController,
      controllerAs: "popupCaptcha",
    };
  });

  TklPopupCaptchaController.$inject = [
    "$rootScope",
    "captcha",
    "$http",
    "$scope",
    "$timeout",
  ];

  /**
   * @description dimmed 컨트롤러
   */
  function TklPopupCaptchaController(
    $rootScope,
    captcha,
    $http,
    $scope,
    $timeout
  ) {
    var ctrl = this;

    var _tkViewState = tk.state.view;
    var _tkPlanState = tk.state.plan;

    var _isAuthResultInvalid = false;
    var _captchaInputEl = document.querySelector("#ipt_captcha");

    var _captchaImgRefreshTimeoutId;

    ctrl.needAuth = _needAuth;
    ctrl.refresh = _refresh;
    ctrl.isInvalidInputData = _isInvalidInputData;
    ctrl.focusCaptchaInputAndHideAuthInvalid =
      _focusCaptchaInputAndHideAuthInvalid;
    ctrl.changeInputDataToUpperCase = _changeInputDataToUpperCase;
    ctrl.isPrevStepBtnNeeded = _isPrevStepBtnNeeded;
    ctrl.goToPrevStep = _goToPrevStep;
    ctrl.auth = _.throttle(_auth, 1000);
    ctrl.isMobile = _isMobile;

    $scope.$watch(
        function () {
          return ctrl.captchaImageSrc;
        },
        function (newSrc, oldSrc) {
          if (newSrc) {
            _captchaImgRefreshTimeoutId = setTimeout(function () {
              _refresh(false);
            }, 1000 * 60 * 3);
          }
        },
        true
    );

    // 캡챠 이미지 중복 요청하는 이슈 방지용
    var _debouncedInit = _.debounce(function () {
      _init();
    }, 30);

    if (captcha.needAuth) {
      var sessionData = sessionStorage.getItem(TKL_MK_CAP_SESS);
      if (sessionData) {
        $http
          .post("/captcha/authState/" + sessionData)
          .then(
            function (res) {
              if (res.data) {
                callRenderInterval();
                clearInitData();
              } else {
                sessionStorage.removeItem(TKL_MK_CAP_SESS);
                _debouncedInit();
              }
            },
            function () {
              callRenderInterval();
              _debouncedInit();
            }
          )
          .finally(function () {});
      } else {
        _debouncedInit();
      }
    } else {
      clearInitData();
    }

    function clearInitData() {
      ctrl.isDisplayed = false;
      ctrl.captchaImageSrc = "";
      ctrl.lastClickedElement = null;
      ctrl.inputData = null;
      ctrl.innerHeight = 0;
    }

    function _init() {
      ctrl.isDisplayed = captcha.needAuth;

      var timeQuery = getTimeQuery();
      ctrl.captchaImageSrc = captcha.captchaKey
        ? "/captcha/image?captchaKey=" + captcha.captchaKey + timeQuery
        : "";
      ctrl.lastClickedElement = null;
      ctrl.inputData = null;
      ctrl.innerHeight = window.innerHeight;

      _captchaInputEl.focus();

    }

    function getTimeQuery() {
      return "&time=" + new Date().getTime();
    }

    function _needAuth() {
      return captcha.needAuth;
    }

    function _refresh(needResetRefreshTimer) {
      if (needResetRefreshTimer) {
        clearTimeout(_captchaImgRefreshTimeoutId);
      }

      var origin = ctrl.captchaImageSrc.split("&time=");
      var timeQuery = getTimeQuery();
      ctrl.captchaImageSrc = origin[0] + timeQuery;

      $scope.$evalAsync();

      ctrl.inputData = null;

      _focusCaptchaInputAndHideAuthInvalid();
    }

    function _isInvalidInputData() {
      return _isAuthResultInvalid;
    }

    function _focusCaptchaInputAndHideAuthInvalid() {
      ctrl.lastClickedElement = "input";
      _isAuthResultInvalid = false;
      _captchaInputEl.focus();
    }

    function _onInputData (event) {
      if (_isAuthResultInvalid) {
        _isAuthResultInvalid = false;
      }

      event.target.value = event.target.value.replace(/[^ㄱ-ㅎ가-힣a-zA-Z]/g, '');
      event.target.value = event.target.value.slice(0, 5);

      if (event.isComposing || event.keyCode === 229) {
        return;
      }

      ctrl.inputData = event.target.value;

      if (ctrl.isMobile() && ctrl.inputData.length === 5) {
        ctrl.lastClickedElement = null;
        _captchaInputEl.blur();
      }

      $scope.$evalAsync();
    }

    document.getElementById('ipt_captcha').addEventListener('input', _onInputData);

    function _changeInputDataToUpperCase() {
      _isAuthResultInvalid = false;

      if (!ctrl.inputData) {
        return;
      }

      ctrl.inputData = ctrl.inputData.toUpperCase();

      if (ctrl.isMobile() && ctrl.inputData.length === 5) {
        ctrl.lastClickedElement = null;
        _captchaInputEl.blur();
      }
    }

    function _isPrevStepBtnNeeded() {
      return true;
    }

    function _goToPrevStep() {
      if (
        _tkPlanState.isKbl ||
        _tkPlanState.isWkbl ||
        _tkPlanState.isKleague ||
        _tkPlanState.isCoupang
      ) {
        tk.utils.windowClose();
      } else {
        _tkViewState.prevStep();
      }
    }

    function _auth() {
      if (!ctrl.inputData || ctrl.inputData.length < 5) {
        _isAuthResultInvalid = true;
        _captchaInputEl.focus();
        return;
      }

      _captchaInputEl.blur();
      var counter = 0;
      var focusChecker = setInterval(function () {
        if (counter > 0) {
          _requestAuth();
          clearInterval(focusChecker);
          return;
        }
        counter++;
      }, 100);
    }

    function _requestAuth() {
      var sess = sessionStorage.getItem(TKL_MK_CAP_SESS);
      if (!sess) {
        var generated = generateUUID();
        sess = generated;
        sessionStorage.setItem(TKL_MK_CAP_SESS, generated);
      }

      $http
        .post("/captcha/auth/" + captcha.captchaKey, {
          answer: ctrl.inputData.toUpperCase(),
          checkValue: sess,
        })
        .then(
          function (res) {
            if (res.data.result.code === 777) {
              alert(
                "보안문자 유효 3분이 지났습니다. 이미지를 새로고침 해주세요."
              );
              return;
            } else if (res.data.result.code !== 0) {
              _isAuthResultInvalid = true;
              _captchaInputEl.focus();
              return;
            }

            _isAuthResultInvalid = false;
            ctrl.isDisplayed = false;
            clearTimeout(_captchaImgRefreshTimeoutId);
            _captchaInputEl.blur();
          },
          function () {
            alert("서버 오류 발생");
          }
        )
        .finally(function () {
          var isDelayNeeded =
            window.isAppWeb && _isIOS() && ctrl.lastClickedElement === "input";
          if (!ctrl.isDisplayed) {
            callDeplyRender(isDelayNeeded ? 400 : 0);
          }
        });
    }

    function _isMobile() {
      var entries =
        /Android|BlackBerry|iPhone|iPad|iPod|iOS|Opera Mini|IEMobile/i;
      return navigator.userAgent.match(entries) !== null;
    }

    function _isIOS() {
      var entries = /iPhone|iPad|iPod|iOS/i;
      return navigator.userAgent.match(entries) !== null;
    }

    function callRenderInterval() {
      var currentRetryCount = 0;
      var retryCount = 5;
      var EVENT_COUNT = 2; // TODO: 추후 onCaptchaAuth의 이벤트 갯수가 늘어나는 경우, 엥귤러 안정성을 위해 카운트 증가 필요함

      var detectEvent = setInterval(function () {
        if (retryCount <= currentRetryCount) {
          clearInterval(detectEvent);
          alert("오류가 발생했습니다.\n새로고침을 해주세요.");
        }

        try {
          if (EVENT_COUNT <= $rootScope.$$listenerCount.onCaptchaAuth) {
            $rootScope.$broadcast("onCaptchaAuth");
            clearInterval(detectEvent);
          }
        } catch (e) {
          console.log("error", e);
        }
        currentRetryCount++;
      }, 100);
    }

    function callDeplyRender(delay) {
      $timeout(function () {
        $rootScope.$broadcast("onCaptchaAuth");
      }, delay);
    }

    function generateUUID() {
      var d = new Date().getTime(); //Timestamp
      var d2 =
        (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = Math.random() * 16; //random number between 0 and 16
          if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
          }
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
    }
  }
})();

/**
 * @author donghyun seo
 * @desc dimmed
 * @external tk.utils, tk.state.view
 */
(function () {
	'use strict';

	angular
		.module('tklProject')
		.directive('tklDimmed', function () {
			return {
				templateUrl: tk.utils.addQueryTime('/resources/jsdev/reserve/seat/ui/component/popup/dimmed.html'),
				transclude: true,
				replace: true,
				scope: {},
				bindToController: {},
				controller: TklDimmedController,
				controllerAs: 'dimmed'
			}
		});

	TklDimmedController.$inject = ['$scope', '$element'];
	/**
	 * @description dimmed 컨트롤러
	 */
	function TklDimmedController ($scope, $element) {
		var ctrl = this;

		var tkViewState = tk.state.view;

		ctrl.display = false;

		activate();

		function activate () {

			tk.event.ui.signals.dimmedOn.add(dimmedOn);
			/**
			 * @description dimmed on
			 */
			function dimmedOn () {
				ctrl.display = true;
				tkViewState.isTooltipShow = false;
				// $scope.$evalAsync();
			}

			tk.event.ui.signals.dimmedOff.add(dimmedOff);
			/**
			 * @description dimmed off
			 */
			function dimmedOff () {
				ctrl.display = false;
				tkViewState.isTooltipShow = true;
				$scope.$evalAsync();
			}

			$element[0].onclick = dimmedClick;
			/**
			 * @description dimmed 영역외 클릭
			 */
			function dimmedClick () {
				tk.event.ui.signals.popupCloseAll.dispatch();
			}
		}
	}
})();
