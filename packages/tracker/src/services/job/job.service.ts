import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository
} from 'typeorm';
// import { getGuardContractInfo } from '@cat-protocol/cat-smartcontracts';
import { LRUCache } from 'lru-cache';
import { TokenStatisticsEntity } from "../../entities/tokenstatistics.entity";

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  private readonly GUARD_PUBKEY: string;
  private readonly TRANSFER_GUARD_SCRIPT_HASH: string;

  private static readonly taprootPaymentCache = new LRUCache<
    string,
    { pubkey: Buffer; redeemScript: Buffer }
  >({
    max: 10000,
    ttlAutopurge: true,
  });

  constructor(
    private dataSource: DataSource,
    @InjectRepository(TokenStatisticsEntity)
    private tokenStatisticsEntityRepository: Repository<TokenStatisticsEntity>,
  ) {
  }

  async onModuleInit() {
    // this.daemonProcessBlocks();
    await this.countCat();
    this.logger.log('start job');
  }


  // private async daemonProcessBlocks() {
  //   while (true) {
  //     try {
  //       await this.countCat();
  //     } catch (e) {
  //       this.logger.error(`daemon process blocks error, ${e.message}`);
  //     }
  //   }
  // }
  /**
   */
  private async countCat() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const task = async () => {
      try {
        this.logger.log("job run ...");
        const sql = `select * from token_info where token_pubkey is not null;`;
        const history = await queryRunner.manager.query(sql, []);

        this.logger.log("start get token mint amount...");
        const mintSql = 'select token_pubkey as tokenkey,COALESCE(SUM(token_amount), 0)  as amount  from token_mint group by token_pubkey'
        const getTokenMintTotal = await queryRunner.manager.query(mintSql, []);

        this.logger.log("start get token holders amount...");
        const holderSql = 'select xonly_pubkey as tokenkey,COUNT(DISTINCT owner_pkh) as holders,count(spend_txid) as utxos_count from tx_out where spend_txid is null  GROUP BY xonly_pubkey ;';
        const tokenHolder = await queryRunner.manager.query(holderSql, []);

        const tokenHolders = new Map();
        for (var i = 0; i < getTokenMintTotal.length; i++) {
          var tokenInfo = getTokenMintTotal[i]
          tokenHolders.set(tokenInfo.tokenkey, tokenInfo);
        }

        for (var i = 0; i < tokenHolder.length; i++) {
          var tHolder = tokenHolder[i]
          var tokenInfo = tokenHolders.get(tHolder.tokenkey)
          const newToken = {
            ...tokenInfo,
            holders: tHolder.holders
          };
          tokenHolders.set(tHolder.tokenkey, newToken);
        }


        this.logger.log("start insert ...");

        for (var i = 0; i < history.length; i++) {
          var tokenInfo = history[i]

          const tokenHolderMint = tokenHolders.get(tokenInfo.token_pubkey);
          if (!tokenHolderMint) {
            this.logger.log('get', tokenHolderMint, "tokenInfo.token_pubkey", tokenInfo.token_pubkey)
          }
          var mint = 0;
          var holders = 0;
          var utxosCount = 0;
          if (tokenHolderMint) {
            mint = tokenHolderMint.amount;
            utxosCount = tokenHolderMint.utxos_count;
            if (tokenHolderMint.holders) {
              holders = tokenHolderMint.holders;
            }
          }

          const entiry = new TokenStatisticsEntity();
          entiry.tokenId = tokenInfo.token_id;
          entiry.tokenName = tokenInfo.raw_info.name;
          entiry.max = tokenInfo.raw_info.max;
          entiry.mint = mint.toString();
          entiry.holders = holders;
          entiry.utxosCount = utxosCount.toString();
          await this.tokenStatisticsEntityRepository.save(entiry);
        }
        this.logger.log("job end ...");

      } catch (error) {
        this.logger.error('job error:', error);
      }
    };

    const intervalId = setInterval(task, 600000);
  }


}
