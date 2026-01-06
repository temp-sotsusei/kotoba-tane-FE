'use client'
import React, { FC, useState } from 'react'

type TitleThumbnailSetterProps = {
  title: string;
  setTitle: (v: string) => void;
  thumbnails: Array<{id: string; url: string}>;
  thumbnailId: string;
  setThumbnailId: (id: string) => void;
}

const TitleThumbnailSetter: FC<TitleThumbnailSetterProps> = ({title, setTitle, thumbnails, thumbnailId, setThumbnailId}) => {
  return (
    <>
      <p className='text-lg font-bold'>だいめい<span className='text-base mx-1'>と</span>ひょうし<span className='text-base mx-1'>を</span>きめよう！</p>
      <div className='w-full flex flex-col gap-2'>
        <label htmlFor="title" className='font-bold'>だいめい</label>
        <div className='border-4 border-[#93C400] p-2 rounded-lg flex gap-1'>
          <input
            id='title'
            type="text"
            placeholder='りんごのおおさま'
            className='w-full focus:outline-none focus:ring-0 focus:border-transparent'
            value={title}
            onChange={(v) => setTitle(v.target.value)}
          />
          <div className='w-14'>{title.length > 99 ? "99+" : title.length}/15</div>
        </div>

        <div className='aspect-[2/3] w-full p-2 rounded-lg shadow-xl bg-white overflow-y-auto'>
          <div className='grid grid-cols-3 gap-4'>
            {thumbnails.map((thumbnail, i) => {
              const isSelected = thumbnailId === thumbnail.id+""+i;

              return (
              <div
                key={thumbnail.id+""+i}
                onClick={(e) => setThumbnailId(thumbnail.id+""+i)}
                className={`
                  aspect-[2/3] w-full bg-amber-200 cursor-pointer rounded-md
                  transition-all duration-200
                  ${isSelected ? "ring-4 ring-[#93C400] scale-[1.03] shadow-xl" : "opacity-80 hover:opacity-100"}
                `}
              >
              </div>
            )})}
          </div>
        </div>
      </div>
    </>
  )
}

export default TitleThumbnailSetter