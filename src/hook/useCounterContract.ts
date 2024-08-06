import {useTonClient} from "./useTonClient.ts";
import {useEffect, useState} from "react";
import {useAsyncInitialize} from "./useAsyncInitialize.ts";
import {Address, OpenedContract} from "@ton/core";
import {COUNTER_ADDRESS} from "../util/constants.ts";
import Counter from "../contract/Counter.ts";
import {useTonConnect} from "./useTonConnect.ts";
import {sleep} from "../util/commonUtil.ts";

export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | string>();
    const {sender} = useTonConnect();

    const counterContract = useAsyncInitialize(async () => {
        if (!client) return;
        const address = Address.parse(COUNTER_ADDRESS);
        const counter = new Counter(address);
        return client.open(counter) as OpenedContract<Counter>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!counterContract) return;
            setVal(null);
            const val = await counterContract.getCounter();
            setVal(val.toString());
            // 5秒钟读取一次
            await sleep(5000);
            getValue();
        }

        getValue();
    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrement(sender);
        }
    }
}