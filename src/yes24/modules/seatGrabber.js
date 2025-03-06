
import {getIframe} from './iframeDetector.js';
/**
 * 根据id点击座位
 * 选择座位
 * @param {string} seatId - The ID of the seat to be clicked.
 */
export function clickSeat(seatId) {

    console.log(`自动点击座位: ${seatId}`);
    const iframe = getIframe();
    const seatElement = iframe.contentDocument.getElementById(seatId);
    if (seatElement) {
        seatElement.click();
    } else {
        console.warn(`座位元素未找到: ${seatId}`);
    }
}

/**
 * 根据传入id集合来点击座位
 * 选择座位
 */
export function clickSeats(seatIds) {
    seatIds.forEach(seatId => clickSeat(seatId));
}


/**
 * 锁票按钮点击
 * <a href="javascript:ChoiceEnd();"><img src="http://tkfile.yes24.com/img/perfsale_fn/eng/btn_booking2.gif" alt="좌석선택완료" class="booking"></a>
 * 先找元素，找不到就执行javascript:ChoiceEnd();
 */
export function clickLockButton() {
    console.log('自动点击锁票按钮');
    const iframe = getIframe();
    const lockButton = iframe.contentDocument.querySelector('a[href="javascript:ChoiceEnd();"]');
    if (lockButton) {
        lockButton.click();
        console.log('锁票按钮已成功点击');
    } else {
        console.warn('锁票按钮未找到，尝试执行ChoiceEnd()');
        iframe.contentWindow.ChoiceEnd();
    }


}