from asyncio.windows_events import NULL
from pyspark import SparkContext
from pyspark.sql import SparkSession
from pyspark import RDD
from itertools import groupby
from functools import reduce
import numpy as np
import pandas as pd

class TF_DF:
    def __init__(self, spark=None):
        if spark is None:
           self.spark = SparkSession.builder.getOrCreate()
        else:
           self.spark = spark
           
           
    def get_tfdf(self, morphs):
        
        def Count_Row(w_list):
           val = []
           for word in w_list:
            if not (word, 1) in val:
                val.append((word, 1))
           return val
       
        def Count_Element(w_list):
           data = []
           for word in w_list:
              if word == None: continue
              data.append((word, 1))
           data.sort(key=lambda x: x[0])
           result = [(key, reduce(lambda x, y: x + y, map(lambda x: x[1], group))) for key, group in groupby(data, lambda x: x[0])]
           return (w_list, result)
        
        if isinstance(morphs, RDD):
           morphs_rdd = morphs
        else :
           morphs_rdd = self.spark.createDataFrame(morphs).rdd
           
        DF = morphs_rdd.map(lambda w_list : Count_Row(w_list))\
                          .flatMap(lambda tup : tup)\
                          .reduceByKey(lambda a, b : a + b).sortBy(lambda r: -r[1])
        TF = morphs_rdd.map(lambda w_list : Count_Element(w_list))
        return TF, DF
    
    def get_best_tfdf(self, morphs):
       TF, DF = self.get_tfdf(morphs)
       TF_broadcast = self.spark.sparkContext.broadcast(TF.collect())
       DF_broadcast = self.spark.sparkContext.broadcast(DF.collect())
       
       def tfdf(w_list):
          tuples = [ word[1] for word in TF_broadcast.value if word[0] == w_list ]
          if len(tuples) != 1: return None
          val = []
          for tup in tuples[0]:
             if len(tup) != 2: continue
             df_value = [ word[1] for word in DF_broadcast.value if word[0] == tup[0] ]
             if len(df_value) != 1: continue
             val.append((tup[0], np.log(int(int(tup[1]) * int(df_value[0])))))
          val.sort(key=lambda x: x[1], reverse=True)
          best = val[0]
          return (w_list, best)
       
       if isinstance(morphs, RDD):
           morphs_rdd = morphs
       else :
           morphs_rdd = self.spark.createDataFrame(morphs).rdd
       tfdfs = morphs_rdd.map(lambda w_list : tfdf(w_list))
       return tfdfs
 
    def get_best_tfidf(self, morphs, length):
       TF, DF = self.get_tfdf(morphs)
       TF_broadcast = self.spark.sparkContext.broadcast(TF.collect())
       DF_broadcast = self.spark.sparkContext.broadcast(DF.collect())
       
       def tfidf(w_list):
          tuples = next((word[1] for word in TF_broadcast.value if word[0] == w_list), None)
          if tuples == None: return None
          val = []
          for tup in tuples:
             if len(tup) != 2: continue
             df_value = next((word[1] for word in DF_broadcast.value if word[0] == tup[0]), None)
             if df_value == None: continue
             val.append((tup[0], int(tup[1]) * np.log(length / (int(df_value) + 1))))
          val.sort(key=lambda x: x[1], reverse=True)
          best = val[0]
          return (w_list, best)
       
       if isinstance(morphs, RDD):
           morphs_rdd = morphs
       else :
           morphs_rdd = self.spark.createDataFrame(morphs).rdd
       tfidfs = morphs_rdd.map(lambda w_list : tfidf(w_list))
       return tfidfs
       
        