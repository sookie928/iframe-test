import CircleFill from '@/assets/icons/CircleFill';
import CircleLine from '@/assets/icons/CircleLine';
import Right from '@/assets/icons/Right';
import Surgical from '@/assets/icons/Surgical';
import { twclsx } from '@/libs/utils';
import Button from '@components/Button';
import { FC } from 'react';

const Back: FC<object> = () => {
  return (
    <div className="bg-[#f7f3ff] rounded-[64px] pl-[32px] pb-[32px] w-full h-[55%] flex flex-col">
      <div className={twclsx('flex gap-[12px] items-center justify-start w-[112px] h-[12px] mt-[142px]')}>
        <CircleFill style="cursor-pointer" />
        <CircleLine style="cursor-pointer" />
        <CircleLine style="cursor-pointer" />
        <CircleLine style="cursor-pointer" />
      </div>
      <div className="flex gap-[4px] mt-[44px] items-center text-gray-850">
        <Surgical /> <div>정형외과</div>
      </div>
      <div className={twclsx('mt-[8px] font-bold text-[32px] desktop:text-[40px] text-gray-850 max-w-[3x]')}>
        도수치료실
      </div>
      <div className={twclsx('mt-[16px] text-[16px] text-gray-850 max-w-[320px]')}>
        {'의료기기를 찾아보는 새로운 방법,'},
      </div>
      <div className={twclsx('mt-[0px] text-[16px] text-gray-850 max-w-[320px]')}>{'3D 쇼룸을 경험해보세요!'}</div>
      <div className={twclsx('flex flex-row justify-between mt-[24px]')}>
        <Button
          className={`flex items-stretch justify-center rounded-lg text-white text-[14px] cursor-pointer min-h-[46px] w-[198px] justify-items-stretch px-[16px] py-[14px]`}
          style={{ backgroundColor: '#8850f8' }}
          content={
            <div className="flex w-full items-center justify-between text-[14px]">
              {`3D 도수치료실 바로가기`}
              <Right />
            </div>
          }
        />
        <div className="hidden mobile:flex"></div>
      </div>
    </div>
  );
};
export default Back;
