import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { errorResponse, okResponse } from '../../common/utils';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}



  @Get('list')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token list' })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'paging offset',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'paging limit',
  })
  async getTokenList(
      @Query('offset') offset: number,
      @Query('limit') limit: number,
  ) {
    try {

      const txHistory = await this.tokenService.getTokenList(
          offset,
          limit,
      );
      return okResponse(txHistory);
    } catch (e) {
      return errorResponse(e);
    }
  }


  @Get()
  @ApiTags('token')
  @ApiOperation({ summary: 'List all tokens' })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'paging offset',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'paging limit',
  })
  async listAllTokens(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10
  ) {
    try {

      const txHistory = await this.tokenService.getTokenList(
          offset,
          limit,
      );
      return okResponse(txHistory);
    } catch (e) {
      return errorResponse(e);
    }
  }

  @Get(':tokenIdOrTokenAddr/supply')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token supply by token id or token address' })
  @ApiParam({
    name: 'tokenIdOrTokenAddr',
    required: true,
    type: String,
    description: 'token id or token address',
  })
  async getTokenSupply(@Param('tokenIdOrTokenAddr') tokenIdOrTokenAddr: string) {
    try {
      const supply = await this.tokenService.getTokenSupply(tokenIdOrTokenAddr);
      return okResponse({ supply });
    } catch (e) {
      return errorResponse(e);
    }
  }
  
  @Get(':tokenIdOrTokenAddr')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token info by token id or token address' })
  @ApiParam({
    name: 'tokenIdOrTokenAddr',
    required: true,
    type: String,
    description: 'token id or token address',
  })
  async getTokenInfo(@Param('tokenIdOrTokenAddr') tokenIdOrTokenAddr: string) {
    try {
      const tokenInfo =
        await this.tokenService.getTokenInfoByTokenIdOrTokenAddressDisplay(
          tokenIdOrTokenAddr,
        );
      return okResponse(tokenInfo);
    } catch (e) {
      return errorResponse(e);
    }
  }

  @Get(':tokenIdOrTokenAddr/addresses/:ownerAddr/utxos')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token utxos by owner address' })
  @ApiParam({
    name: 'tokenIdOrTokenAddr',
    required: true,
    type: String,
    description: 'token id or token address',
  })
  @ApiParam({
    name: 'ownerAddr',
    required: true,
    type: String,
    description: 'token owner address',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'paging offset',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'paging limit',
  })
  async getTokenUtxosByOwnerAddress(
    @Param('tokenIdOrTokenAddr') tokenIdOrTokenAddr: string,
    @Param('ownerAddr') ownerAddr: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    try {
      const utxos = await this.tokenService.getTokenUtxosByOwnerAddress(
        tokenIdOrTokenAddr,
        ownerAddr,
        offset,
        limit,
      );
      return okResponse(utxos);
    } catch (e) {
      return errorResponse(e);
    }
  }

  @Get(':tokenIdOrTokenAddr/addresses/:ownerAddr/balance')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token balance by owner address' })
  @ApiParam({
    name: 'tokenIdOrTokenAddr',
    required: true,
    type: String,
    description: 'token id or token address',
  })
  @ApiParam({
    name: 'ownerAddr',
    required: true,
    type: String,
    description: 'token owner address',
  })
  async getTokenBalanceByOwnerAddress(
    @Param('tokenIdOrTokenAddr') tokenIdOrTokenAddr: string,
    @Param('ownerAddr') ownerAddr: string,
  ) {
    try {
      const balance = await this.tokenService.getTokenBalanceByOwnerAddress(
        tokenIdOrTokenAddr,
        ownerAddr,
      );
      return okResponse(balance);
    } catch (e) {
      return errorResponse(e);
    }
  }

  @Get(':tokenIdOrTokenAddr/addresses/:ownerAddr/history')
  @ApiTags('token')
  @ApiOperation({ summary: 'Get token tx history by owner address' })
  @ApiParam({
    name: 'tokenIdOrTokenAddr',
    required: true,
    type: String,
    description: 'token id or token address',
  })
  @ApiParam({
    name: 'ownerAddr',
    required: true,
    type: String,
    description: 'token owner address',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'paging offset',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'paging limit',
  })
  async getTokenTxHistoryByOwnerAddress(
    @Param('tokenIdOrTokenAddr') tokenIdOrTokenAddr: string,
    @Param('ownerAddr') ownerAddr: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    try {
      const txHistory = await this.tokenService.getTokenTxHistoryByOwnerAddress(
        tokenIdOrTokenAddr,
        ownerAddr,
        offset,
        limit,
      );
      return okResponse(txHistory);
    } catch (e) {
      return errorResponse(e);
    }
  }
}
