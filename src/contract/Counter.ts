import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender} from "@ton/core";

export default class Counter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {
    }

    static createForDeploy(code: Cell, initialCounterValue: number): Counter {
        const data = beginCell()
            .storeUint(initialCounterValue, 64)
            .endCell();
        const init = {code, data};
        const address = contractAddress(0, init);
        return new Counter(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: '0.01', // // 给合约发送0.01 TON作为租金使用
            bounce: false,
        });
    }

    async getCounter(provider: ContractProvider) {
        const {stack} = await provider.get('counter', []);
        return stack.readBigNumber();
    }

    async sendIncrement(provider: ContractProvider, via: Sender) {
        const messageBody = beginCell()
            .storeUint(1, 32) // 操作类型：op = 1
            .storeUint(0, 64) // 查询id（用于关联返回的响应消息）
            .endCell();
        await provider.internal(via, {
            value: '0.002', // gas
            body: messageBody
        });
    }
}