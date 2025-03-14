/**
 * 座位分析模块 - 分析座位数据
 */

/**
 * 分析座位信息
 * @param {Document} doc - iframe的contentDocument
 * @returns {Object} 包含座位信息的对象
 */
export function analyzeSeatInfo(doc) {
    try {
        // 座位区域选择器
        const selectors = {
            allSeats: '#divSeatArray div[class^="s"]',
            // 修正：s13是不可选的，可选座位是s9(VIP席), s6(R席), s8(S席)
            availableSeats: '#divSeatArray div.s9, #divSeatArray div.s6, #divSeatArray div.s8',
            vipSeats: '#divSeatArray div.s9',
            rSeats: '#divSeatArray div.s6',
            sSeats: '#divSeatArray div.s8',
            selectedList: '#liSelSeat p'
        };
        
        // 获取各类型座位
        const allSeats = Array.from(doc.querySelectorAll(selectors.allSeats) || []);
        const availableSeats = Array.from(doc.querySelectorAll(selectors.availableSeats) || []);
        const vipSeats = Array.from(doc.querySelectorAll(selectors.vipSeats) || []);
        const rSeats = Array.from(doc.querySelectorAll(selectors.rSeats) || []);
        const sSeats = Array.from(doc.querySelectorAll(selectors.sSeats) || []);
        
        // 获取已选座位
        const selectedSeats = Array.from(doc.querySelectorAll(selectors.selectedList) || []);
        
        // 提取座位等级信息
        const seatsWithInfo = allSeats.map(seat => {
            const title = seat.getAttribute('title') || '';
            const id = seat.id || '';
            const grade = seat.getAttribute('grade') || '';
            let seatType = '';
            
            // 修正：判断座位类型和是否可用
            if (seat.classList.contains('s9')) {
                seatType = 'VIP席';
                // VIP席是可选的
                return {
                    id: id,
                    element: seat,
                    title: title,
                    grade: grade || seatType,
                    type: seatType,
                    isAvailable: true
                };
            } else if (seat.classList.contains('s6')) {
                seatType = 'R席';
                // R席是可选的
                return {
                    id: id,
                    element: seat,
                    title: title,
                    grade: grade || seatType,
                    type: seatType,
                    isAvailable: true
                };
            } else if (seat.classList.contains('s8')) {
                seatType = 'S席';
                // S席是可选的
                return {
                    id: id,
                    element: seat,
                    title: title,
                    grade: grade || seatType,
                    type: seatType,
                    isAvailable: true
                };
            } else {
                seatType = '已售/不可用';
                // 其他类型（如s13）是不可选的
                return {
                    id: id,
                    element: seat,
                    title: title,
                    grade: grade || '普通席',
                    type: seatType,
                    isAvailable: false
                };
            }
        });
        
        // 处理VIP、R、S等座位的详细信息
        const vipInfo = vipSeats.map(seat => {
            return {
                id: seat.id || '',
                element: seat,
                title: seat.getAttribute('title') || '',
                grade: seat.getAttribute('grade') || 'VIP席',
                type: 'VIP席',
                isAvailable: true
            };
        });
        
        const rInfo = rSeats.map(seat => {
            return {
                id: seat.id || '',
                element: seat,
                title: seat.getAttribute('title') || '',
                grade: seat.getAttribute('grade') || 'R席',
                type: 'R席',
                isAvailable: true
            };
        });
        
        const sInfo = sSeats.map(seat => {
            return {
                id: seat.id || '',
                element: seat,
                title: seat.getAttribute('title') || '',
                grade: seat.getAttribute('grade') || 'S席',
                type: 'S席',
                isAvailable: true
            };
        });
        
        const availableInfo = availableSeats.map(seat => {
            let type = '普通席';
            if (seat.classList.contains('s9')) type = 'VIP席';
            else if (seat.classList.contains('s6')) type = 'R席';
            else if (seat.classList.contains('s8')) type = 'S席';
            
            return {
                id: seat.id || '',
                element: seat,
                title: seat.getAttribute('title') || '',
                grade: seat.getAttribute('grade') || type,
                type: type,
                isAvailable: true
            };
        });
        
        // 提取已选座位信息
        const selectedSeatsInfo = selectedSeats.map(seat => {
            const text = seat.textContent || '';
            return {
                id: text,
                text: text
            };
        });
        
        // 返回座位信息对象 - 同时包含数量统计和详细信息列表
        const result = {
            total: allSeats.length,
            available: availableSeats.length,
            vip: vipSeats.length,
            r: rSeats.length,
            s: sSeats.length,
            selected: selectedSeats.length,
            seatsWithInfo: seatsWithInfo,
            selectedSeatsInfo: selectedSeatsInfo,
            // 新增详细座位信息列表
            vipInfo: vipInfo,
            rInfo: rInfo,
            sInfo: sInfo,
            availableInfo: availableInfo,
            allSeatsInfo: seatsWithInfo
        };
        
        
        console.log('分析座位信息完成，共发现：', {
            总座位: result.total,
            可选座位: result.available,
            VIP席: result.vip,
            R席: result.r,
            S席: result.s,
            已选座位: result.selected,
            seatsWithInfo: result.seatsWithInfo,
            selectedSeatsInfo: result.selectedSeatsInfo,
            vipInfo: result.vipInfo,
            rInfo: result.rInfo,
            sInfo: result.sInfo,
            availableInfo: result.availableInfo,
            allSeatsInfo: result.allSeatsInfo
        });
        
        return result;
    } catch (error) {
        console.error('分析座位信息时出错:', error);
        return {
            total: 0,
            available: 0,
            vip: 0,
            r: 0,
            s: 0,
            selected: 0,
            seatsWithInfo: [],
            selectedSeatsInfo: [],
            vipInfo: [],
            rInfo: [],
            sInfo: [],
            availableInfo: [],
            allSeatsInfo: []
        };
    }
}
