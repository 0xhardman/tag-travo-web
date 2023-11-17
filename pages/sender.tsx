import Image from 'next/image'
import { Albert_Sans } from 'next/font/google'
import clsx from 'clsx'
import Arrow from '@/components/Arrow'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { dataSwapContract } from "@/contracts/dataSwapContract";
import { Tag } from '@/type'
import Layout from '@/components/Layout'
import { Autocomplete, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, InputAdornment, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material'
import { type } from 'os'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import { useAccount, useContractReads, useContractWrite } from 'wagmi'

const inter = Albert_Sans({ subsets: ['latin'] })

function Label({ required, value }: { required: boolean, value: string }) {
  return (
    <Box
      textAlign={{ xs: 'left', sm: 'right' }}
      sx={{
        fontWeight: 'bold',
        color: '#101828',
        lineHeight: '56px',
        width: '85px',
      }}
    >
      {required && <span style={{ color: '#DC0202' }}>* </span>}
      {value}
    </Box>
  );
}

export default function Sender() {
  const { address } = useAccount()
  const { data: writeData, isLoading: isWriteLoading, isSuccess, writeAsync } = useContractWrite({
    ...dataSwapContract as any,
    functionName: 'send',
  })
  const ids = [7074046504243040256, 7086575438692093952, 7093087508845563904, 7098147946901803008]
  const { data, isError, isLoading } = useContractReads({
    contracts: ids.map((id, index) => {
      return {
        ...dataSwapContract as any,
        functionName: 'buyRecords',
        args: [address, id],
      }
    })

  })
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      content: '',
      tag: '',
    },
  });

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [disabletSubmitBtn, setDisableSubmitBtn] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [options, setOptions] = useState([
    { id: '1', name: 'Tag1', total: 101 },
    { id: '2', name: 'Tag2', total: 102 },
    { id: '3', name: 'Tag3', total: 103 },
  ]);
  useEffect(() => {
    if (data) {
      const temp = data?.map((item, index) => {
        return { id: ids[index], balance: data[index].result, name: `Tag ${index + 1}`, total: 13 }
      })
      setOptions(temp as any)
    }
  }, [data])
  const loading = open && options.length === 0;
  return (
    <Layout>
      <main
        className={`flex min-h-[calc(100vh-70px)] flex-col items-center justify-start p-24 ${inter.className} bg-[#fffeff]`}
      >
        <Typography variant='h3' fontWeight='600' color={"#008093"}>Mail Sender</Typography>
        <Typography align='center' variant='h5' color="gray" mb={2}>Hi! Data consumer!<br />
          You can send your mail to the tag owner!</Typography>
        <div className={clsx('flex relative flex-col gap-[6px]',
          'w-[862px]  px-[28px] py-[12px]',
          'bg-white border-[#22222243] border rounded-[24px]',
          'text-[#7c7c7c]')}>
          <Box maxWidth={1000} marginTop="50px">
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              marginBottom={{ xs: '0', sm: '15px' }}
            >
              <Box marginRight="10px">
                <Label required={true} value={'Title: '} />
              </Box>
              <Box flex={1}>
                <Controller
                  name={'title'}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value, onBlur } }: any) => {
                    return (
                      <OutlinedInput
                        rows={3}
                        sx={{ width: '100%' }}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    );
                  }}
                />
                {errors.title && (
                  <Typography
                    marginTop={1}
                    fontSize="0.85rem"
                    color="#d32f2f"
                    marginLeft={2}
                  >
                    Reason is required
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              marginBottom={{ xs: '0', sm: '15px' }}
            >
              <Box marginRight="10px">
                <Label required={true} value={'Content: '} />
              </Box>
              <Box flex={1}>
                <Controller
                  name={'content'}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value, onBlur } }: any) => {
                    return (
                      <OutlinedInput
                        multiline
                        rows={8}
                        sx={{ width: '100%' }}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    );
                  }}
                />
                {errors.content && (
                  <Typography
                    marginTop={1}
                    fontSize="0.85rem"
                    color="#d32f2f"
                    marginLeft={2}
                  >
                    Reason is required
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              marginBottom={{ xs: '0', sm: '15px' }}
            >
              <Box marginRight="10px">
                <Label required={true} value={'Tag: '} />
              </Box>
              <Box flex={1}>
                <Controller
                  name={'tag'}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value, onBlur } }: any) => {
                    return (
                      <>
                        <Autocomplete
                          open={open}
                          onOpen={() => {
                            setOpen(true);
                          }}
                          onClose={() => {
                            setOpen(false);
                          }}
                          isOptionEqualToValue={(option, kvalue) => {
                            return option.name === kvalue.name;
                          }}
                          getOptionLabel={(option) => {
                            return 'For ' + option.name + ' users You have ' + option?.balance + ' times mail send access';
                          }}
                          onChange={(e, value) => {
                            onChange(value?.id);
                          }}
                          onBlur={onBlur}
                          options={options}
                          loading={loading}
                          renderInput={(params) => {
                            return (
                              <TextField
                                {...params}
                                value={value}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loading ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            );
                          }}
                        />
                        <Typography
                          marginTop={1}
                          fontSize="0.85rem"
                          color="#d32f2f"
                          marginLeft={2}
                        >
                          {errors?.tag ? 'Name is required' : ''}
                        </Typography>
                      </>
                    );
                  }}
                />

              </Box>
            </Box>
          </Box>
          <div onClick={handleSubmit(
            (data) => {
              writeAsync(
                {
                  args: [data.tag, data.title, data.content],
                }
              )
            }
          )} className='cursor-pointer self-end w-[140px] rounded-[18px] bg-[#1f7f94] text-[20px] text-white h-[58px] flex justify-center items-center'>
            Swap
          </div>
        </div>
      </main>
    </Layout>
  )
}
