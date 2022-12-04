import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MyAsset } from './my-asset';

@Info({title: 'MyAssetContract', description: 'My Smart Contract' })
export class MyAssetContract extends Contract {

    @Transaction(true)
    public async createAsset(ctx: Context, AssetId: string, value: string): Promise<void> {
        const exists: boolean = await this.checkAsset(ctx, AssetId);   
        if (exists) {
            throw new Error(` ${AssetId} already exists`);
        }
        const asset: MyAsset = new MyAsset();
        asset.value = value;
        const buffer: Buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(AssetId, buffer);
    }

    @Transaction(false)
    @Returns('boolean')
    public async checkAsset(ctx: Context, AssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(AssetId);
        return (!!data && data.length > 0);
    }

    @Transaction(true)
    public async updateAsset(ctx: Context, AssetId: string, newValue: string): Promise<void> {
        const exists: boolean = await this.checkAsset(ctx, AssetId);
        if (!exists) {
            throw new Error(` ${AssetId} doesn't exist`);
        }
        const asset: MyAsset = new MyAsset();
        asset.value = newValue;
        const buffer: Buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(AssetId, buffer);
    }

    @Transaction(false)
    public async showAssets(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allRes = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allRes.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allRes);
                return JSON.stringify(allRes);
            }
        }
    }

}
