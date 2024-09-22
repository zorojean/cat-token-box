import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { Constants } from '../../common/constants';
import { TxOutEntity } from '../../entities/txOut.entity';
import { BlockService } from '../../services/block/block.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class MinterService {
  constructor(
    private readonly blockService: BlockService,
    private readonly tokenService: TokenService,
    @InjectRepository(TxOutEntity)
    private readonly txOutRepository: Repository<TxOutEntity>,
  ) { }

  async getMinterUtxos(
    tokenIdOrTokenAddr: string,
    offset: number,
    limit: number,
  ) {
    const utxos = await this.queryMinterUtxos(
      tokenIdOrTokenAddr,
      offset || Constants.QUERY_PAGING_DEFAULT_OFFSET,
      Math.min(
        limit || Constants.QUERY_PAGING_DEFAULT_LIMIT,
        Constants.QUERY_PAGING_MAX_LIMIT,
      ),
    );
    return {
      utxos: await this.tokenService.renderUtxos(utxos.utxos),
      trackerBlockHeight: utxos.trackerBlockHeight,
    };
  }

  async getMinterUtxoCount(tokenIdOrTokenAddr: string) {
    // const utxos = await this.queryMinterUtxos(tokenIdOrTokenAddr);
    const trackerBlockHeight =
      await this.blockService.getLastProcessedBlockHeight();
    const tokenInfo =
      await this.tokenService.getTokenStatisticsInfoByTokenIdOrTokenAddress(
        tokenIdOrTokenAddr,
      ); 
    // let count = 0;
    // if (trackerBlockHeight !== null && tokenInfo?.minterPubKey) {
    //   count = await this.txOutRepository.query('select count(spend_txid) from tx_out where xonly_pubkey =$1 and spend_txid is null', [{
    //     xOnlyPubKey: tokenInfo.minterPubKey,
    //   }]);
    // }
    return {
      count: tokenInfo.utxosCount,
      trackerBlockHeight,
    };
  }

  async queryMinterUtxos(
    tokenIdOrTokenAddr: string,
    offset: number = null,
    limit: number = null,
  ) {
    const lastProcessedHeight =
      await this.blockService.getLastProcessedBlockHeight();
    const tokenInfo =
      await this.tokenService.getTokenInfoByTokenIdOrTokenAddress(
        tokenIdOrTokenAddr,
      );
    let utxos = [];
    if (lastProcessedHeight !== null && tokenInfo?.minterPubKey) {
      utxos = await this.txOutRepository.find({
        where: {
          xOnlyPubKey: tokenInfo.minterPubKey,
          spendTxid: IsNull(),
          blockHeight: LessThanOrEqual(lastProcessedHeight),
        },
        order: { createdAt: 'ASC' },
        skip: offset,
        take: limit,
      });
    }
    return { utxos, trackerBlockHeight: lastProcessedHeight };
  }


}
